'use strict';

const nkm = require(`@nkmjs/core`);
const u = nkm.utils;
const io = nkm.io;

const RemoteDataBlock = require(`./remote-data-block`);

//const axios = require('axios');

class UserData extends RemoteDataBlock {

    constructor() { super(); }

    _isID64(p_str) {
        if (!p_str) { return false; }
        var reg = /^\d+$/;
        if (reg.test(p_str) && p_str.length == 17) {
            return true;
        } else {
            return false;
        }
    }

    _Init() {
        super._Init();

        this._loadPriority = true;
        this._loadParallel = true;

        this._triedWithPersona = false;

        this._userID = "";
        this._active = true;

        this._profileID64 = "";
        this._personaID = "";
        this._avatarURL = "";
        this._privacy = "";
        this._isUsingCache = false;

        this._gameList = new nkm.collections.Dictionary();

        this._xmlparser = new DOMParser();

        this._Bind(this._OnProfileByIDRequestSuccess);
        this._Bind(this._OnProfileByIDRequestError);

        this._Bind(this._OnXMLProfileLoaded);
        this._Bind(this._OnXMLProfileError);

    }

    get gamesLoaded() { return this._gamesLoaded; }
    get gamesCount() { return this._gameList.count; }

    get userid() { return this._userID; }
    set userid(p_value) {
        if (this._userID == p_value) { return; }

        var oldUID = this._userID;
        this._userID = p_value;

        if (this._db) {
            this._db._UpdateUserID(this, oldUID);
        }
    }

    get active() { return this._active; }
    set active(p_value) {
        if (this._active == p_value) { return; }
        this._active = p_value;
        this.CommitUpdate();
    }

    set profileID64(p_value) {
        if (this._profileID64 == p_value || !this._isID64(p_value)) { return; }
        this._profileID64 = p_value;
        this.userid = p_value;
        this._dataPath = nkm.env.APP._GetURLLibrary(p_value);

    }
    get profileID64() { return this._profileID64; }



    //
    //  Data loading
    //

    // Profile

    RequestRefresh() {
        if (this._state != RemoteDataBlock.STATE_READY) { return; }
        let cachePath = `users._${this.userid}.gamelist`;
        nkm.env.prefs.Delete(cachePath);
        this._ClearGameList();
        this.RequestLoad(true);
    }

    RequestLoad(b_force = false) {

        if (!b_force && this._state != RemoteDataBlock.STATE_NONE) { return; }

        if (this._isID64(this.userid)) {

            this.profileID64 = this.userid;
            this._LoadProfile();

        } else {

            this._personaID = this.userid;
            this.state = RemoteDataBlock.STATE_LOADING;

            io.Read(
                nkm.env.APP._GetURLProfile(this.userid),
                { cl: io.resources.TextResource },
                {
                    success: this._OnProfileByIDRequestSuccess,
                    error: this._OnProfileByIDRequestError,
                    important: true, parallel: true
                }
            );

        }
    }

    _OnProfileByIDRequestSuccess(p_rsc) {
        try {
            var xmlDoc = this._xmlparser.parseFromString(p_rsc.content, "text/xml");
            this.profileID64 = xmlDoc.getElementsByTagName(`steamID64`)[0].childNodes[0].nodeValue;
        } catch (e) {
            this._OnProfileByIDRequestError(e);
            return;
        }

        this._OnXMLProfileLoaded(p_rsc);
    }

    _OnProfileByIDRequestError(p_err) {
        // User does not exists
        console.error(`Could not load profile details`, p_err);
        this.state = RemoteDataBlock.STATE_INVALID;
    }

    // Actual profile

    _LoadProfile() {

        // TODO : Check cache here
        io.Read(
            nkm.env.APP._GetURLProfile64(this._profileID64),
            { cl: io.resources.TextResource },
            {
                success: this._OnXMLProfileLoaded,
                error: this._OnXMLProfileError,
                important: true, parallel: true
            }
        );
    }

    _OnXMLProfileLoaded(p_rsc) {

        var xmlDoc = this._xmlparser.parseFromString(p_rsc.content, "text/xml");

        this.profileID64 = xmlDoc.getElementsByTagName(`steamID64`)[0].childNodes[0].nodeValue;
        this._personaID = xmlDoc.getElementsByTagName(`steamID`)[0].childNodes[0].nodeValue;
        this._avatarURL = xmlDoc.getElementsByTagName(`avatarFull`)[0].childNodes[0].nodeValue;
        this._privacy = xmlDoc.getElementsByTagName(`privacyState`)[0].childNodes[0].nodeValue;
        this._limitedAccount = xmlDoc.getElementsByTagName(`isLimitedAccount`)[0].childNodes[0].nodeValue;

        let cachePath = `users._${this.userid}.gamelist`;
        let cachedGamelist = nkm.env.prefs.Get(cachePath, []);


        if (cachedGamelist && cachedGamelist.length > 0) {
            //TODO : Flag user as cached game list
            this._isUsingCache = true;
            this._ProcessGameList(cachedGamelist);
            this.CommitUpdate();
            super._OnLoadRequestSuccess(p_rsc);
        } else {
            this._isUsingCache = false;
            this.CommitUpdate();
            super.RequestLoad(true);
        }

    }

    _OnXMLProfileError(p_err) {
        //console.error(p_err);
        this.state = RemoteDataBlock.STATE_INVALID;
    }

    // Game list

    _OnLoadRequestSuccess(p_rsc) {

        let gamelist = [];

        try {

            var sourceSplit = p_rsc.content.split(`var rgGames = `);
            sourceSplit.splice(0, 1);
            sourceSplit = sourceSplit[0].split(`];`)[0].trim();

            try {
                gamelist = JSON.parse(`${sourceSplit}]`);
            } catch (e) {
                console.log(`${sourceSplit}]`);
            }

            for (var i = 0; i < gamelist.length; i++) {
                // Skim game data, we just need appid
                gamelist[i] = gamelist[i].appid;
            }

        } catch (e) {

            this._OnLoadRequestError(e);
            return;

        }

        let cachePath = `users._${this.userid}.gamelist`;
        nkm.env.prefs.Set(cachePath, gamelist);
        this._ProcessGameList(gamelist);
        super._OnLoadRequestSuccess(p_rsc);

    }

    _ProcessGameList(p_inputList) {

        for (var i = 0, n = p_inputList.length; i < n; i++) {
            var appid = p_inputList[i];
            let game = this._db.GetGame(appid);
            game.AddUser(this);
            this._gameList.Set(appid, game);
        }

        if (p_inputList.length == 0) {
            this._privacy = `private`;
        }


    }

    _ClearGameList() {
        var keys = this._gameList.keys;
        for (var i = 0, n = keys.length; i < n; i++) {
            this._gameList.Get(keys[i]).RemoveUser(this);
        }
    }

    // Second profile fetch

    _CleanUp() {
        this._ClearGameList();
        this._gameList.Clear();
        
        this._triedWithPersona = false;

        this._userID = "";
        this._active = true;

        this._profileID64 = "";
        this._personaID = "";
        this._avatarURL = "";
        this._privacy = "";
        this._isUsingCache = false;

        super._CleanUp();
    }


}

module.exports = UserData;