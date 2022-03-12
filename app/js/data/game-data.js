'use strict';
const nkm = require(`@nkmjs/core`);

const RemoteDataBlock = require(`./remote-data-block`);
const SIGNAL = require(`../signal`);

class GameData extends RemoteDataBlock {

    constructor() { super(); }

    _Init() {
        super._Init();

        this._mode = `no-cors`;

        this._rscType = nkm.io.resources.JSONResource;

        this._appid = "";
        this._parentGame = null;
        
        this._flags = null;
        this._tags = null;
        this._cooptimus = false;
        this._specs = false;

        this._users = new Array();
        this._childs = new Array();

        this._order = 0;
        this._activeUserCount = 0;

        this._name = ``;
        this._logo = ``;

        this._filterCache = {};

        this._passFilters = false;
        this._passOverlap = false;

        this._delayedInfoUpdate = nkm.com.DelayedCall(this._Bind(this._DispatchInfosUpdate));
        this._delayedCommitUpdate = nkm.com.DelayedCall(this._Bind(this.CommitUpdate));

    }

    get passFilters() { return this._passFilters; }
    set passFilters(p_value) {
        if (this._passFilters == p_value) { return; }
        this._passFilters = p_value;
        this._delayedInfoUpdate.Schedule();
    }

    get passOverlap() { return this._passOverlap; }
    set passOverlap(p_value) {
        if (this._passOverlap == p_value) { return; }
        this._passOverlap = p_value;
        this._delayedInfoUpdate.Schedule();
    }

    get order() { return this._order; }
    set order(p_value) {
        if (this._order == p_value) { return; }
        this._order = p_value;
        this._delayedInfoUpdate.Schedule();
    }

    get activeUserCount() { return this._activeUserCount; }
    set activeUserCount(p_value) {
        if (this._activeUserCount == p_value) { return; }
        this._activeUserCount = p_value;
        this._delayedInfoUpdate.Schedule();
    }

    _DispatchInfosUpdate(){ this._Broadcast(SIGNAL.INFOS_UPDATED, this); }

    get usercount() { return this._users.length; }

    get appid() { return this._appid; }
    set appid(p_value) {
        this._appid = p_value;
        this._name = `${p_value}`;
        this._logo = `https://steamcdn-a.akamaihd.net/steam/apps/${p_value}/library_600x900.jpg`;
        this._dataPath = `https://nebukam.github.io/steam-db/app/${p_value}/infos.json`;
    }

    get name() { return this._name; }
    set name(p_value) {
        if (this._name == p_value) { return; }
        this._name = p_value;
        this._delayedCommitUpdate.Schedule();
    }

    get logo() { return this._logo; }
    set logo(p_value) {
        if (this._logo == p_value) { return; }
        this._logo = p_value;
        this._delayedCommitUpdate.Schedule();
    }

    /////

    HasAnyActiveUsers() {
        for (var i = 0; i < this._users.length; i++) {
            if (this._users[i].active) { return true; }
        }
        return false;
    }

    /////

    _OnLoadRequestSuccess(p_rsc) {

        this._flags = p_rsc.content.flags;
        this._tags = p_rsc.content.tags;
        this._name = p_rsc.content.name;
        this._cooptimus = p_rsc.content.cooptimus;
        this._specs  = p_rsc.content.specs;

        let parentID = p_rsc.content.parentappid;
        if (parentID != ``) {
            if (!this._flags.includes(21)) { this._flags.push(21); } //DLC
            this._parentGame = nkm.env.APP.database.GetGame(parentID);
            this._parentGame.AddChild(this);
        }

        if(this._tags.includes(`Movie`)){
            this._OnLoadRequestError();
        }else{
            super._OnLoadRequestSuccess(p_rsc);
        }
    }

    AddChild(p_game) {
        if (!this._childs.includes(p_game)) {
            this._childs.push(p_game);

            if (p_game._flags && !p_game._flags.includes(21)) {
                p_game._flags.push(21);
                p_game._delayedCommitUpdate.Schedule();
            }

            this._delayedCommitUpdate.Schedule();
        }
    }

    AddUser(p_user) {
        let index = this._users.indexOf(p_user);
        if (index == -1) {
            this._users.push(p_user);
            this._delayedCommitUpdate.Schedule();
        }
    }

    RemoveUser(p_user) {
        let index = this._users.indexOf(p_user);
        if (index != -1) {
            this._users.splice(index, 1);
            this._delayedCommitUpdate.Schedule();
        }
        
    }

    _CleanUp() {
        super._CleanUp();
    }

}

module.exports = GameData;