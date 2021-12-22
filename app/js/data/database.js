'use strict';

const nkm = require(`@nkmjs/core`);
const u = nkm.utils;
const collections = nkm.collections;

const GameData = require("./game-data");
const UserData = require("./user-data");
const FilterManager = require(`../filtering/filter-manager`);

const RemoteDataBlock = require(`./remote-data-block`);

const SIGNAL = require(`../signal`);

const ID_USER_LIST = `userlist`;

class Database extends nkm.com.pool.DisposableObjectEx {

    constructor() { super(); }

    _Init() {
        super._Init();

        this._gameMap = new collections.Dictionary();
        this._applist = new Array();

        this._userMap = new collections.Dictionary();
        this._userReadyList = new nkm.collections.List();

        this._delayedSort = new nkm.com.time.DelayedCall(this._Bind(this._SortGames));

    }

    //#region Games

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
    }

    _OnGameStateChanged(p_game, p_state) {

        if (p_state == RemoteDataBlock.STATE_READY) {

            if (!this._applist.includes(p_game)) {
                this._applist.push(p_game);
                this._Broadcast(SIGNAL.GAME_ADDED, p_game);
                p_game.Watch(nkm.com.SIGNAL.UPDATED, this._OnGameUpdated, this);
                this._delayedSort.Schedule();
            }

        }

    }

    _SortGames() {

        return;

        this._applist.sort((a, b) => {
            var ta = a.name.toUpperCase();
            var tb = b.name.toUpperCase();
            return (ta < tb) ? -1 : (ta > tb) ? 1 : 0;
        });

        for(let i = 0; i < this._applist.length; i++){
            this._applist[i].order = i;
        }

    }

    //#endregion

    //#region Users

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

        if (this._userReadyList.Contains(p_user)) {
            this._userReadyList.Remove(p_user);
        }

        this._Broadcast(SIGNAL.USER_REMOVED, p_user);
        this._UpdateStoredUserlist();
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

            this._UpdateStoredUserlist();
            this._Broadcast(SIGNAL.USER_UPDATED, p_user);

        }

    }

    _UpdateStoredUserlist() {
        nkm.env.prefs.Set(ID_USER_LIST, this._GetUserJSONData());
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

    //#endregion

    _CleanUp() {
        super._CleanUp();
    }

}

module.exports = Database;