'use strict';

const nkm = require(`@nkmjs/core`);
const u = nkm.utils;
const collections = nkm.collections;
const filters = require(`./filter-groups`);
const DATA_SIGNAL = require(`../signal`);

class FilterManager extends nkm.com.pool.DisposableObjectEx {

    constructor() { super(); }

    _Init() {
        super._Init();

        this._groups = [];
        this._updatedGroups = [];

        this._filteredCount = 0;
        this._overlapCount = 0;
        this._activeCount = 0;

        this._overlap = this._AddGroup(filters.Overlap);

        this._toggles = this._AddGroup(filters.Toggles);
        this._regular = this._AddGroup(filters.Regular);
        this._cooptimus = this._AddGroup(filters.Cooptimus);

        // TODO : Only update filters when needed
        this._delayedApply = new nkm.com.time.DelayedCall(this._Bind(this._ApplyFilters));
        this._delayedUpdate = new nkm.com.time.DelayedCall(this._Bind(this._UpdateFilters));

        let database = nkm.env.APP.database;
        database.Watch(DATA_SIGNAL.GAME_ADDED, this._OnGameAdded, this);

        database.Watch(DATA_SIGNAL.USER_ADDED, this._OnUserUpdate, this);
        database.Watch(DATA_SIGNAL.USER_REMOVED, this._OnUserUpdate, this);
        database.Watch(DATA_SIGNAL.USER_UPDATED, this._OnUserUpdate, this);

        //TODO : Overlap only needs to be updated when a user is toggled, not EVERY TIME
        this._filterGroups = [this._regular, this._cooptimus];

    }

    _PostInit() {
        super._PostInit();
        for (let i = 0; i < this._groups.length; i++) {
            this._groups[i]._toggles = this._toggles;
            this._groups[i].Load();
        }
    }

    get overlap() { return this._overlap; }
    get toggles() { return this._toggles; }
    get regular() { return this._regular; }
    get cooptimus() { return this._cooptimus; }

    _AddGroup(p_class) {

        let group = new p_class();

        group._manager = this;
        this._groups.push(group);

        return group;

    }

    _OnGroupUpdated(p_group) {

        if (!this._updatedGroups.includes(p_group)) {
            this._updatedGroups.push(p_group);
            this._delayedApply.Schedule();
        }

    }

    _ApplyFilters() {

        let gamelist = nkm.env.APP.database._applist;

        for (let i = 0; i < this._updatedGroups.length; i++) {
            let group = this._updatedGroups[i];
            if (group == this._toggles) { continue; }
            group._CheckList(gamelist, 0, gamelist.length);
        }

        this._updatedGroups.length = 0;

        this._filteredCount = 0;
        this._overlapCount = 0;
        this._activeCount = 0;

        // Post process
        for (let i = 0; i < gamelist.length; i++) {
            let
                appData = gamelist[i],
                fCache = appData._filterCache;

            if (appData.passOverlap) { this._overlapCount++; }

            if (fCache[this._regular._id]
                && fCache[this._cooptimus._id]) {
                appData.passFilters = true;
                this._filteredCount++;
            } else {
                appData.passFilters = false;
            }

            if(appData.passFilters && appData.passOverlap){
                this._activeCount++;
            }
        }

        this._Broadcast(nkm.com.SIGNAL.UPDATED, this);

    }

    _UpdateFilters() {

        let gamelist = nkm.env.APP.database._applist;

        for (let i = 0; i < this._groups.length; i++) {
            let group = this._groups[i];
            if (group == this._toggles) { continue; }
            group._CheckList(gamelist, 0, gamelist.length);
        }

        this._filteredCount = 0;
        this._overlapCount = 0;
        this._activeCount = 0;

        // Post process
        for (let i = 0; i < gamelist.length; i++) {
            let
                appData = gamelist[i],
                fCache = appData._filterCache;

            if (appData.passOverlap) { this._overlapCount++; }

            if (fCache[this._regular._id]
                && fCache[this._cooptimus._id]) {
                appData.passFilters = true;
                this._filteredCount++;
            } else {
                appData.passFilters = false;
            }

            if(appData.passFilters && appData.passOverlap){
                this._activeCount++;
            }

        }

        this._Broadcast(nkm.com.SIGNAL.UPDATED, this);

    }

    _SingleUpdateFilters(p_app) {

        let fCache = p_app._filterCache;

        for (let i = 0; i < this._groups.length; i++) {
            let group = this._groups[i];
            if (group == this._toggles) { continue; }
            fCache[group._id] = group._Check(p_app);
        }

        if (fCache[this._regular._id]
            && fCache[this._cooptimus._id]) {
            p_app.passFilters = true;
        } else {
            p_app.passFilters = false;
        }

        this._Broadcast(nkm.com.SIGNAL.UPDATED, this);

    }

    _OnGameAdded(p_app) {
        // Update this game only
        this._SingleUpdateFilters(p_app);
        this._delayedUpdate.Schedule();
    }

    _OnUserUpdate(p_user) {
        this._delayedUpdate.Schedule();
    }

}

module.exports = FilterManager;