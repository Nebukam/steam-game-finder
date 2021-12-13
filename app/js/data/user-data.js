'use strict';

const nkm = require(`@nkmjs/core`);
const u = nkm.utils;
const io = nkm.io;

const RemoteDataBlock = require("./remote-data-block");

//const axios = require('axios');

class UserData extends RemoteDataBlock {

    constructor() { super(); }

    _Init() {
        super._Init();

        this._userID = "";
        this._profileID64 = "";
        this._active = true;

        this._personaID = "";
        this._avatarURL = "";
        this._privacy = "";

        this._gameList = new nkm.collections.Dictionary();

        this._xmlparser = new DOMParser();

        this._Bind(this._OnDetailsRequestSuccess);
        this._Bind(this._OnDetailsRequestError);

        this._Bind(this._OnProfileRequestSuccess);
        this._Bind(this._OnProfileRequestError);

    }

    get gamesLoaded() { return this._gamesLoaded; }
    get gamesCount() { return this._gameList.count; }

    get userid() { return this._userID; }
    set userid(p_value) {
        this._userID = p_value;
        this._personaID = p_value;
    }

    get active() { return this._active; }
    set active(p_value) {
        this._active = p_value;
        this.CommitUpdate();
    }

    set profileID64(p_value) {
        this._profileID64 = p_value;
        //this._dataPath = `http://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key=${ENV.APP._APIKEY}&steamid=${p_value}&format=json`;
        this._dataPath = `https://steamcommunity.com/profiles/${p_value}/games/?tab=all`;
    }
    get profileID64() { return this._profileID64; }

    //
    //  Data loading
    //

    // Profile

    RequestLoad() {

        this.state = RemoteDataBlock.STATE_LOADING;

        this._personaID = this._userID;
        var reg = /^\d+$/;

        if (reg.test(this._userID) && this._userID.length == 17) {
            this.profileID64 = this._userID;
            this._LoadProfile();
        } else {
            io.Read(
                `https://steamcommunity.com/id/${this._userID}?xml=1`,
                { cl: io.resources.TextResource },
                {
                    success: this._OnDetailsRequestSuccess,
                    error: this._OnDetailsRequestError
                }
            );
        }
    }

    _OnDetailsRequestSuccess(p_rsc) {
        try {
            
            var xmlDoc = this._xmlparser.parseFromString(p_rsc.content, "text/xml");
            this.profileID64 = xmlDoc.getElementsByTagName(`steamID64`)[0].childNodes[0].nodeValue;
            //console.log(`${this._userID} == ${this._profileID64}`);
            //this._LoadProfile();
            this._OnProfileRequestSuccess(p_rsc);
        } catch (e) {
            this._OnDetailsRequestError(e);
        }
    }

    _OnDetailsRequestError(p_err) {
        // User does not exists
        this.state = RemoteDataBlock.STATE_INVALID;
    }

    // Actual profile

    _LoadProfile() {
        io.Read(
            `https://steamcommunity.com/profiles/${this._profileID64}?xml=1`,
            { cl: io.resources.TextResource },
            {
                success: this._OnProfileRequestSuccess,
                error: this._OnProfileRequestError
            }
        );
    }

    _OnProfileRequestSuccess(p_rsc) {

        var xmlDoc = this._xmlparser.parseFromString(p_rsc.content, "text/xml");

        this._personaID = xmlDoc.getElementsByTagName(`steamID`)[0].childNodes[0].nodeValue;;
        this._avatarURL = xmlDoc.getElementsByTagName(`avatarFull`)[0].childNodes[0].nodeValue;
        this._privacy = xmlDoc.getElementsByTagName(`privacyState`)[0].childNodes[0].nodeValue;
        this._limitedAccount = xmlDoc.getElementsByTagName(`isLimitedAccount`)[0].childNodes[0].nodeValue;

        this.CommitUpdate();
        super.RequestLoad(true);

    }

    _OnProfileRequestError(p_err) {
        console.error(p_err);
        this.state = RemoteDataBlock.STATE_INVALID;
    }

    // Game list

    _OnLoadRequestSuccess(p_rsc) {
        
        try {

            var game = null;
            var sourceSplit = p_rsc.content.split(`var rgGames = `);
            sourceSplit.splice(0, 1);
            sourceSplit = sourceSplit[0].split(`];`)[0].trim();

            try {
                var games = JSON.parse(`${sourceSplit}]`);
            } catch (e) {
                console.log(`${sourceSplit}]`);
            }

            var gamedata;
            for (var i = 0, n = games.length; i < n; i++) {
                gamedata = games[i];
                var appid = gamedata.appid;
                game = this._db.GetGame(appid);
                game.AddUser(this);
                game.name = gamedata.name;
                game.logo = gamedata.logo;
                //console.log(gamedata);
                this._gameList.Set(appid, game);
                game.RequestLoad();
            }

            super._OnLoadRequestSuccess(p_rsc);

        } catch (e) {
            this._OnLoadRequestError(e);
        }
    }

    // Second profile fetch

    _CleanUp() {

        this._userID = "";
        this._profileID64 = "";

        this._personaID = "";
        this._avatarURL = "";
        this._privacy = "";

        var keys = this._gameList.keys;
        for (var i = 0, n = keys.length; i < n; i++) { 
            this._gameList.Get(keys[i]).RemoveUser(this); 
        }

        this._gameList.Clear();
        super._CleanUp();
    }


}

module.exports = UserData;