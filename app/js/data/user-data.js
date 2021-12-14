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

        this._loadPriority = true;
        this._loadParallel = true;

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

    RequestLoad(b_force = false) {

        if (!b_force && this._state != RemoteDataBlock.STATE_NONE) {
            return;
        }

        this._personaID = this._userID;
        var reg = /^\d+$/;

        if (reg.test(this._userID) && this._userID.length == 17) {
            this.profileID64 = this._userID;
            this._LoadProfile();
        } else {
            this.state = RemoteDataBlock.STATE_LOADING;
            io.Read(
                `https://steamcommunity.com/id/${this._userID}?xml=1`,
                { cl: io.resources.TextResource },
                {
                    success: this._OnDetailsRequestSuccess,
                    error: this._OnDetailsRequestError,
                    important: true, parallel: true
                }
            );
        }
    }

    _OnDetailsRequestSuccess(p_rsc) {
        try {
            var xmlDoc = this._xmlparser.parseFromString(p_rsc.content, "text/xml");
            this.profileID64 = xmlDoc.getElementsByTagName(`steamID64`)[0].childNodes[0].nodeValue;
        } catch (e) {
            this._OnDetailsRequestError(e);
            return;
        }

        this._OnProfileRequestSuccess(p_rsc);
    }

    _OnDetailsRequestError(p_err) {
        // User does not exists
        console.error(`Could not load profile details`);
        this.state = RemoteDataBlock.STATE_INVALID;
    }

    // Actual profile

    _LoadProfile() {
        io.Read(
            `https://steamcommunity.com/profiles/${this._profileID64}?xml=1`,
            { cl: io.resources.TextResource },
            {
                success: this._OnProfileRequestSuccess,
                error: this._OnProfileRequestError,
                important: true, parallel: true
            }
        );
    }

    _OnProfileRequestSuccess(p_rsc) {

        var xmlDoc = this._xmlparser.parseFromString(p_rsc.content, "text/xml");

        this._profileID64 = xmlDoc.getElementsByTagName(`steamID64`)[0].childNodes[0].nodeValue;
        this._personaID = xmlDoc.getElementsByTagName(`steamID`)[0].childNodes[0].nodeValue;
        this._avatarURL = xmlDoc.getElementsByTagName(`avatarFull`)[0].childNodes[0].nodeValue;
        this._privacy = xmlDoc.getElementsByTagName(`privacyState`)[0].childNodes[0].nodeValue;
        this._limitedAccount = xmlDoc.getElementsByTagName(`isLimitedAccount`)[0].childNodes[0].nodeValue;

        let cachePath = `gamelists.${this.profileID64}`;
        let gameList = nkm.env.APP.userPreferences.Get(cachePath, []);

        if (gameList && gameList.length > 0) {
            //TODO : Flag user as cached game list
            this._ProcessGameList(gameList);
            this.CommitUpdate();
            super._OnLoadRequestSuccess(p_rsc);
        } else {
            this.CommitUpdate();
            super.RequestLoad(true);
        }

    }

    _OnProfileRequestError(p_err) {
        console.error(p_err);
        this.state = RemoteDataBlock.STATE_INVALID;
    }

    // Game list

    _OnLoadRequestSuccess(p_rsc) {

        let gameList = [];

        try {

            var sourceSplit = p_rsc.content.split(`var rgGames = `);
            sourceSplit.splice(0, 1);
            sourceSplit = sourceSplit[0].split(`];`)[0].trim();

            try {
                gameList = JSON.parse(`${sourceSplit}]`);
            } catch (e) {
                console.log(`${sourceSplit}]`);
            }
            
            for(var i = 0; i < gameList.length; i++){
                let game = gameList[i];
                // Skim game data, we just need appid
                gameList[i] = {
                    appid:game.appid,
                    name:game.name,
                    //logo:game.logo
                }
            }

        } catch (e) {

            this._OnLoadRequestError(e);
            return;

        }

        let cachePath = `gamelists.${this.profileID64}`;
        nkm.env.APP.userPreferences.Set(cachePath, gameList);

        this._ProcessGameList(gameList);

        super._OnLoadRequestSuccess(p_rsc);


    }

    _ProcessGameList(p_inputList) {

        for (var i = 0, n = p_inputList.length; i < n; i++) {
            let gamedata = p_inputList[i];
            var appid = gamedata.appid;

            let game = this._db.GetGame(appid);
            game.AddUser(this);
            game.name = gamedata.name;
            game.logo = `https://steamcdn-a.akamaihd.net/steam/apps/${appid}/library_600x900.jpg`; //gamedata.logo;
            this._gameList.Set(appid, game);
            game.RequestLoad();
        }

        if (p_inputList.length == 0) {
            this._privacy = `private`;
        }


    }

    _ClearGameList(){
        var keys = this._gameList.keys;
        for (var i = 0, n = keys.length; i < n; i++) {
            this._gameList.Get(keys[i]).RemoveUser(this);
        }
    }

    // Second profile fetch

    _CleanUp() {

        this._userID = "";
        this._profileID64 = "";

        this._personaID = "";
        this._avatarURL = "";
        this._privacy = "";

        this._ClearGameList();

        this._gameList.Clear();
        super._CleanUp();
    }


}

module.exports = UserData;