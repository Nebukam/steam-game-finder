'use strict';

/*const nkm = require(`@nkmjs/core`);*/
const u = nkm.utils;
const collections = nkm.collections;
const SIGNAL = require(`../../signal`);

const FilterGroup = require(`./filter-group`);

const _GRTR = `>=`;
const _SMLR = `<=`;

class FilterGroupTags extends FilterGroup {

    constructor() { super(); }

    _Init() {
        super._Init();
        this._id = `filterlist-tags`;

        this._loaded = false;
        this._cached = [];

        nkm.io.Read(
            `https://nebukam.github.io/steam-db/tags.json`,
            { cl: nkm.io.resources.JSONResource },
            {
                success: this._Bind(this._OnTagListLoaded),
                error: this._Bind(this._OnTagListError),
                important: true,
                parallel: true,
                mode:'no-cors'
            }
        );



    }

    _OnTagListLoaded(p_rsc) {

        this._loaded = true;

        //console.log(`Tag list : `);
        //console.log(p_rsc.content);

        p_rsc.content.sort();

        let DB = nkm.env.APP.database;

        for (let i = 0; i < p_rsc.content.length; i++) {
            let tag = p_rsc.content[i],
                flag = this._cached.includes(tag) ? true : false;
            this._Add({ key: tag, flag: flag, id: tag, isTag: true, isUsed: false });
        }

        this._Broadcast(nkm.com.SIGNAL.READY, this);

    }

    _OnTagListError(p_err) {

    }

    _Check(p_app) {

        if (!this._loaded) { return true; }
        if (!this._toggles.isTagsEnabled) { return true; }

        if (!p_app._tags) { return false; }

        if (this._toggles.isTagExclusiveEnabled) {
            for (let i = 0; i < this._filters.length; i++) {

                let filter = this._filters[i];

                if (!filter.isUsed || !filter.flag) { continue; }

                if (!p_app._tags.includes(filter.id)) { return false; }

            }

            return true;
        } else {
            for (let i = 0; i < this._filters.length; i++) {

                let filter = this._filters[i];

                if (!filter.isUsed || !filter.flag) { continue; }

                if (p_app._tags.includes(filter.id)) { return true; }

            }

            return false;
        }



    }

    _ReadCache(p_item) {
        let filter = this._map.Get(`${p_item}`);
        if (!filter) { return; }
        filter.flag = true;
        this._cached.push(`${p_item}`);
    }

    _WriteCache(p_item) {
        if (p_item.flag) { return p_item.key; }
        return null;
    }

}

module.exports = FilterGroupTags;