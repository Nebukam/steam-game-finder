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
const ID_COOP_FILTER_LIST = `cooptimusFilterlist`;
const ID_GLOBAL_TOGGLE = `globalTogglelist`;

class Database extends nkm.com.pool.DisposableObjectEx {

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

        this._delayedUpdate = new nkm.com.time.DelayedCall(this._Bind(this._UpdateInfos));
        this._delayedComputeOverlap = new nkm.com.time.DelayedCall(this._Bind(this._ComputeLibrariesOverlap));

        this._enums = [];
        this._enums.push({ key: "1", id: `Multiplayer`, flag: true }); // 1
        this._enums.push({ key: "2", id: `Single Player`, flag: false }); // 2
        this._enums.push({ key: "49", id: `PVP`, flag: true }); // 3
        this._enums.push({ key: "36", id: `PvP - Online`, flag: true, label: `Online` }); // PvP Online
        this._enums.push({ key: "47", id: `PvP - LAN`, flag: false, label: `LAN` }); // PvP LAN
        this._enums.push({ key: "37", id: `PvP - Splitscreen`, flag: false, label: `Splitscreen` }); // PvP Splitscreen
        this._enums.push({ key: "9", id: `Co-op`, flag: true }); // Coop
        this._enums.push({ key: "38", id: `Co-op - Online`, flag: true, label: `Online` }); // Coop Online
        this._enums.push({ key: "48", id: `Co-op - LAN`, flag: false, label: `LAN` }); // Coop LAN
        this._enums.push({ key: "39", id: `Co-op - Splitscreen`, flag: false, label: `Splitscreen` }); // Coop Splitscreen
        this._enums.push({ key: "21", id: `DLC`, flag: false }); // 0
        this._enums.push({ key: "20", id: `MMO`, flag: false }); // 5
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

        this._extraEnums = [];

        this._filterExclusive = { key: "90000", id: `Show only exclusive matches`, flag: false };
        this._filterShowAll = { key: "90001", id: `Show all`, flag: false };
        this._filterUseCooptimus = { key: "90002", id: `Enable Co-optimus`, flag: false };

        this._extraEnums.push(this._filterExclusive);
        this._extraEnums.push(this._filterShowAll);
        this._extraEnums.push(this._filterUseCooptimus);

        let localValues = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12];
        let onlineValues = [0, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 14, 16, 20, 24, 26, 30, 32, 35, 64, 100, 255, 500];
        let lanValues = [0, 2, 3, 4, 5, 6, 7, 8, 10, 11, 12, 14, 16, 20, 24, 30, 32, 35, 64, 255, 256, 500];

        this._cooptimusEnums = [];
        this._cooptimusEnums.push({ key: "91001", id: `Max local`, flag: false, label: `Min`, values: localValues, selection: 0 });
        this._cooptimusEnums.push({ key: "91002", id: `Min local`, flag: false, label: `Max`, values: localValues, selection: localValues.length - 1 });
        this._cooptimusEnums.push({ key: "91003", id: `Max online`, flag: false, label: `Min`, values: onlineValues, selection: 0 });
        this._cooptimusEnums.push({ key: "91004", id: `Min online`, flag: false, label: `Max`, values: onlineValues, selection: onlineValues.length - 1 });
        this._cooptimusEnums.push({ key: "91005", id: `Max lan`, flag: false, label: `Min`, values: lanValues, selection: 0 });
        this._cooptimusEnums.push({ key: "91006", id: `Min lan`, flag: false, label: `Max`, values: lanValues, selection: lanValues.length - 1 });

        this._cooptimusEnums.push({ key: "91101", id: `Max local`, flag: false, label: `Splitscreen` });
        this._cooptimusEnums.push({ key: "91102", id: `Min local`, flag: false, label: `Drop-in/Drop-out` });
        this._cooptimusEnums.push({ key: "91102", id: `Min local`, flag: false, label: `Co-op Campaign` });

        this._Bind(this._UpdateFilters);
        this._filters = new Array();
        let cachedFilters = nkm.env.prefs.Get(ID_FILTER_LIST, this._filters);
        if (cachedFilters == this._filters) { this._UpdateFilters(); }
        else { this._LoadStoredFilterList(cachedFilters); }

        this._Bind(this._UpdateCoopFilters);
        this._coopfilters = new Array();
        let cachedCoopFilters = nkm.env.prefs.Get(ID_COOP_FILTER_LIST, this._coopfilters);
        if (cachedCoopFilters == this._coopfilters) { this._UpdateCoopFilters(); }
        else { this._LoadStoredCoopFilterList(cachedFilters); }

        this._Bind(this._UpdateToggles);
        this._toggles = new Array();
        let cachedToggles = nkm.env.prefs.Get(ID_GLOBAL_TOGGLE, this._toggles);
        if (cachedToggles == this._toggles) { this._UpdateToggles(); }
        else { this._LoadStoredToggleList(cachedFilters); }

    }

    _LoadStoredFilterList(filterlist) {

        for (let i = 0, n = this._enums.length; i < n; i++) {
            let en = this._enums[i];
            en.flag = filterlist.includes(en.key);
        }

        this._UpdateFilters();

    }

    _LoadStoredCoopFilterList(coopFilterlist) {

        for (var i = 0; i < coopFilterlist.length; i++) {
            let stored = coopFilterlist[i];
            innerloop:
            for (var e = 0; e < this._cooptimusEnums.length; e++) {
                let en = this._cooptimusEnums[e];
                if (stored.key == en.key) {
                    en.flag = stored.flag; 
                    if (stored.selection) { en.selection = stored.selection; }
                    break innerloop;
                }
            }
        }

        this._UpdateCoopFilters();

    }

    _LoadStoredToggleList(togglelist) {

        for (var i = 0; i < togglelist.length; i++) {
            let stored = togglelist[i];
            innerloop:
            for (var e = 0; e < this._extraEnums.length; e++) {
                let en = this._extraEnums[e];
                if (stored.key == en.key) {
                    en.flag = stored.flag;
                    break innerloop;
                }
            }
        }

        this._UpdateToggles();

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
                p_game.Watch(nkm.com.SIGNAL.UPDATED, this._OnGameUpdated, this);
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
            user.Watch(nkm.com.SIGNAL.RELEASED, this._OnUserReleased, this);
            user.userid = p_userID;
            user.active = p_active;
            user._db = this;
            this._userMap.Set(p_userID, user);
            this._Broadcast(SIGNAL.USER_ADDED, user);
            user.Watch(nkm.com.SIGNAL.UPDATED, this._OnUserUpdate, this);
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

    _UpdateCoopFilters() {

        this._coopfilters.length = 0;

        for (let i = 0, n = this._cooptimusEnums.length; i < n; i++) {
            let en = this._cooptimusEnums[i];
            this._coopfilters.push({ key: en.key, flag: en.flag, selection: en.selection });
        }

        //TODO : manage selection etc, DO NOT STORE A NUMBER >.<

        nkm.env.prefs.Delete(ID_COOP_FILTER_LIST);
        nkm.env.prefs.Set(ID_COOP_FILTER_LIST, this._coopfilters);

        this._Broadcast(SIGNAL.FILTERS_UPDATED, this);
        this._delayedUpdate.Schedule();

    }

    _UpdateToggles() {

        this._toggles.length = 0;

        for (let i = 0, n = this._extraEnums.length; i < n; i++) {
            let en = this._extraEnums[i];
            this._toggles.push({ key: en.key, flag: en.flag });
        }

        // TODO : Manage a more complex object than a number, just in case

        nkm.env.prefs.Delete(ID_GLOBAL_TOGGLE);
        nkm.env.prefs.Set(ID_GLOBAL_TOGGLE, this._toggles);

        this._Broadcast(SIGNAL.FILTERS_UPDATED, this);
        this._delayedUpdate.Schedule();

    }

    _UpdateInfos() {

        let game;
        this._filteredCount = 0;

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
            let hasFlags = this._filterShowAll.flag ? true : game.HasFlags(this._filters);
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