'use strict';

/*const nkm = require(`@nkmjs/core`);*/
const u = nkm.utils;
const collections = nkm.collections;

class FilterGroup extends nkm.com.pool.DisposableObjectEx {

    constructor() { super(); }

    _Init() {

        super._Init();

        this._filters = new Array();
        this._map = new collections.Dictionary();
        this._Bind(this._OnFilterUpdated);
        this._delayedSave = nkm.com.DelayedCall(this._Bind(this.Save));
        this._id = null;

        this._manager = null;
        this._toggles = null;

        this._lastMatchCount = 0;

    }

    _Add(p_filter) {
        this._filters.push(p_filter);
        p_filter._updateFn = this._OnFilterUpdated;
        this._map.Set(`${p_filter.key}`, p_filter);
        return p_filter;
    }

    _CheckList(p_list, p_from, p_count) {
        this._lastMatchCount = 0;

        let p_to = p_from + p_count;
        for (let i = p_from; i < p_to; i++) {
            let
                app = p_list[i],
                result = this._Check(app);

            app._filterCache[this._id] = result;

            if (result) { this._lastMatchCount++; }
        }
    }

    _Check(p_app) {

    }

    _OnFilterUpdated() {
        this._manager._OnGroupUpdated(this);
        this._delayedSave.Schedule();
    }

    Load() {
        let cache = nkm.env.prefs.Get(this._id, []);
        for (let i = 0; i < cache.length; i++) {
            this._ReadCache(cache[i]);
        }
        this._OnFilterUpdated();
    }

    _ReadCache(p_item) {

    }

    Save() {

        let cache = [];
        for (let i = 0; i < this._filters.length; i++) {
            let cachedInfo = this._WriteCache(this._filters[i]);
            if (cachedInfo) { cache.push(cachedInfo); }
        }

        nkm.env.prefs.Delete(this._id);
        nkm.env.prefs.Set(this._id, cache);

    }

    _WriteCache(p_item) {

    }


}

module.exports = FilterGroup;