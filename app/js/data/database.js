'use strict';

const nkm = require(`@nkmjs/core`);
const u = nkm.utils;
const collections = nkm.collections;

const GameData = require("./game-data");
const UserData = require("./user-data");

const RemoteDataBlock = require(`./remote-data-block`);

const SIGNAL = require(`./signal`);
const ID_USER_LIST = `userlist`;
const ID_FILTER_LIST = `filterlist`;

class Database extends nkm.common.pool.DisposableObjectEx {

    constructor() { super(); }

    _Init() {
        super._Init();

        this._gameMap = new collections.Dictionary();
        this._applist = new Array();

        this._flagMap = new collections.Dictionary();
        this._userMap = new collections.Dictionary();
        this._currentOverlap = new Array();
        this._filteredCount = 0;

        this._userReadyList = new nkm.collections.List();

        this._userStatuses = RemoteDataBlock.STATE_NONE;

        this._delayedUpdate = new nkm.common.time.DelayedCall(this._Bind(this._UpdateInfos));
        this._delayedComputeOverlap = new nkm.common.time.DelayedCall(this._Bind(this._ComputeLibrariesOverlap));

        this._enums = [];
        this._enums.push({ key: "21", id: `dlc`, flag: false }); // 0
        //this._enums.push({ key: "1", id: `multiplayer`, flag: true }); // 1
        this._enums.push({ key: "2", id: `single_player`, flag: false }); // 2
        this._enums.push({ key: "49", id: `pvp`, flag: true }); // 3
        this._enums.push({ key: "9", id: `coop`, flag: true }); // 4
        this._enums.push({ key: "20", id: `MMO`, flag: false }); // 5
        this._enums.push({ key: "36", id: `Online PvP`, flag: true }); // 6
        this._enums.push({ key: "38", id: `Online Coop`, flag: true }); // 7
        this._enums.push({ key: "47", id: `LAN PvP`, flag: false }); // 8
        this._enums.push({ key: "48", id: `LAN Coop`, flag: false }); // 9
        this._enums.push({ key: "37", id: `Split screen PvP`, flag: false }); // 10
        this._enums.push({ key: "39", id: `Split screen Coop`, flag: false }); // 11
        //    this._enums.push({ key:"27", id:`cross_platform_mp`, flag:false }); // 12
        //    this._enums.push({ key:"29", id:`trading_cards`, flag:false }); // 13
        //    this._enums.push({ key:"35", id:`in_app_purchase`, flag:false }); // 14
        //    this._enums.push({ key:"18", id:`partial_controller_support`, flag:false }); // 15
        //    this._enums.push({ key:"28", id:`full_controller_support`, flag:false }); // 16
        //    this._enums.push({ key:"22", id:`achievements`, flag:false }); // 17
        //    this._enums.push({ key:"22", id:`steam_cloud`, flag:false }); // 18
        //    this._enums.push({ key:"13", id:`captions`, flag:false }); // 19
        //    this._enums.push({ key:"42", id:`remote_play_tablet`, flag:false }); // 20
        //    this._enums.push({ key:"43", id:`remote_play_tv`, flag:false }); // 21
        this._enums.push({ key: "44", id: `Remote play together`, flag: false }); // 22
        //    this._enums.push({ key:"30", id:`steam_workshop`, flag:false }); // 23
        //    this._enums.push({ key:"32", id:`steam_turn_notification`, flag:false }); // 24
        this._enums.push({ key: "-1", id: `Show all`, flag: false }); // 22

        this._filterShowAll = { id: `Show all`, flag: false };

        this._filters = new Array();

        let cachedFilters = nkm.env.prefs.Get(ID_FILTER_LIST, this._filters);

        if (cachedFilters == this._filters) {
            this._UpdateFilters();
        } else {
            this._LoadStoredFilterList(cachedFilters);
        }

    }

    _LoadStoredFilterList(filterlist) {

        for (let i = 0, n = this._enums.length; i < n; i++) {
            let en = this._enums[i];
            en.flag = filterlist.includes(en.key);
        }

        this._UpdateFilters();

    }

    ////

    GetGame(p_appid) {

        let game = null;
        if (this._gameMap.Contains(p_appid)) {
            game = this._gameMap.Get(p_appid);
        } else {
            game = new GameData();
            game.appid = p_appid;
            game._db = this;
            game.Watch(SIGNAL.STATE_CHANGED, this._OnGameStateChanged, this);
            this._gameMap.Set(p_appid, game);
            game.RequestLoad();
        }

        return game;
    }

    _OnGameUpdated(p_game) {
        this._Broadcast(SIGNAL.GAME_UPDATED, p_game);
        this._delayedUpdate.Schedule();
    }

    _OnGameStateChanged(p_game, p_state) {

        if (p_state == RemoteDataBlock.STATE_READY) {

            if (!this._applist.includes(p_game)) {

                this._applist.push(p_game);
                this._Broadcast(SIGNAL.GAME_ADDED, p_game);
                p_game.Watch(nkm.common.SIGNAL.UPDATED, this._OnGameUpdated, this);
                this._delayedComputeOverlap.Schedule();

            }

        }

    }

    /////

    FindUser(p_userID) {
        if (this._userMap.Contains(p_userID)) {
            return this._userMap.Get(p_userID);
        } else {
            let keys = this._userMap.keys;
            p_userID = p_userID.toLowerCase();
            for (var i = 0; i < keys.length; i++) {
                let user = this._userMap.Get(keys[i]);
                if (user._personaID.toLowerCase() == p_userID) { return user; }
            }
            return null;
        }
    }

    GetUser(p_userID, p_active = true) {

        let user = this.FindUser(p_userID);

        if (!user) {

            user = new UserData();
            user.Watch(nkm.common.SIGNAL.RELEASED, this._OnUserReleased, this);
            user.userid = p_userID;
            user.active = p_active;
            user._db = this;
            this._userMap.Set(p_userID, user);
            this._Broadcast(SIGNAL.USER_ADDED, user);
            user.Watch(nkm.common.SIGNAL.UPDATED, this._OnUserUpdate, this);
            user.RequestLoad();

        }

        return user;

    }

    _UpdateUserID(p_user, p_oldUID) {
        let cUser = this._userMap.Get(p_oldUID);
        if (cUser == p_user) {
            this._userMap.Remove(p_oldUID);
            this._userMap.Set(p_user.userid, p_user);
        }
    }

    _OnUserReleased(p_user) {
        this._userMap.Remove(p_user.userid);
        this._Broadcast(SIGNAL.USER_REMOVED, p_user);

        if (this._userReadyList.Contains(p_user)) {
            this._userReadyList.Remove(p_user);
            this._delayedComputeOverlap.Schedule();
        }

        nkm.env.prefs.Set(ID_USER_LIST, this._GetUserJSONData());

        this._delayedUpdate.Schedule();
    }

    _OnUserUpdate(p_user) {

        if (p_user.state == RemoteDataBlock.STATE_READY) {

            //TODO: If game count > 0 -> add to readylist
            //otherwise ignore or remove
            let recompute = false;
            if (p_user.gamesCount > 0 && p_user.active) {
                if (!this._userReadyList.Contains(p_user)) {
                    this._userReadyList.Add(p_user);
                    recompute = true;
                }
            } else {
                if (this._userReadyList.Contains(p_user)) {
                    this._userReadyList.Remove(p_user);
                    recompute = true;
                }
            }

            if (recompute) {
                this._delayedComputeOverlap.Schedule();
            }

            nkm.env.prefs.Set(ID_USER_LIST, this._GetUserJSONData());

        }

    }

    _GetUserJSONData(p_keys = null) {

        if (!p_keys) { p_keys = this._userMap.keys; }

        let user;
        let data = [];
        for (let i = 0, n = p_keys.length; i < n; i++) {
            user = this._userMap.Get(p_keys[i]);
            if (user.profileID64 == ``) { continue; }
            data.push({ id: user.profileID64, active: user.active });
        }

        return data;

    }

    _ComputeLibrariesOverlap() {

        this._currentOverlap.length = 0;

        // For each game in ref library, check if it is present in others'
        for (var i = 0; i < this._applist.length; i++) {

            let app = this._applist[i];
            let appid = app.appid;
            let shared = true;

            for (var a = 0; a < this._userReadyList.count; a++) {
                if (!this._userReadyList.At(a)._gameList.Contains(appid)) { shared = false; }
            }

            if (shared) {
                this._currentOverlap.push(app);
            } else {
                app.shouldShow = false;
            }
        }

        this._delayedUpdate.Schedule();

    }

    _UpdateFilters() {

        this._filters.length = 0;

        if(!this._filterShowAll.flag){
            this._ComputeLibrariesOverlap();
        }

        for (let i = 0, n = this._enums.length; i < n; i++) {
            let en = this._enums[i];
            if (en.flag) {
                this._filters.push(en.key);
            }
        }

        nkm.env.prefs.Delete(ID_FILTER_LIST);
        nkm.env.prefs.Set(ID_FILTER_LIST, this._filters);

        this._Broadcast(SIGNAL.FILTERS_UPDATED, this);
        this._delayedUpdate.Schedule();

    }

    _UpdateInfos() {

        let game;
        this._filteredCount = 0;

        if(this._filterShowAll.flag){
            for(var i = 0; i < this._applist.length; i++){
                game = this._applist[i];
                if(game.HasAnyActiveUsers()){
                    this._filteredCount ++;
                    game.shouldShow = true;
                }else{
                    game.shouldShow = false;
                }
            }
            this._Broadcast(SIGNAL.INFOS_UPDATED, this);
            return;
        }

        // Update game infos, when available
        if (this._currentOverlap.length == 0) {
            //Either no game, or no overlap yet.
            this._Broadcast(SIGNAL.INFOS_UPDATED, this);
            return;
        }

        // Reset all games to shouldShow = false;
        for (let i = 0, n = this._applist.length; i < n; i++) {
            this._applist[i].shouldShow = false;
        }

        // Flag overlapped games that meet filter criterias
        for (let i = 0, n = this._currentOverlap.length; i < n; i++) {
            game = this._currentOverlap[i];
            let hasFlags = game.HasFlags(this._filters);
            game.shouldShow = hasFlags;
            if (hasFlags) { this._filteredCount++; }
        }

        this._Broadcast(SIGNAL.INFOS_UPDATED, this);
    }

    _CleanUp() {
        super._CleanUp();
    }

}

module.exports = Database;