'use strict';

const nkm = require(`@nkmjs/core`);
const u = nkm.utils;
const collections = nkm.collections;

const FilterGroup = require(`./filter-group`);

const _GRTR = `>=`;
const _SMLR = `<=`;

class FilterGroupSpecs extends FilterGroup {

    constructor() { super(); }

    _Init() {
        super._Init();
        this._id = `filterlist-specs`;

        let localValues = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 500];

        this._Add({
            key: 1, flag: false, id: `Min size`, label: `At least %s GBs`, group:`Storage size`,
            values: localValues, selection: 0, coopid: `storage`, check: _GRTR
        });

        this._Add({
            key: 1, flag: false, id: `Max size`, label: `At most %s GBs`, group:`Storage size`,
            values: localValues, selection: 0, coopid: `storage`, check: _SMLR
        });

    }

    _Check(p_app) {

        if (!this._toggles.isSpecsEnabled) { return true; }
        if (!p_app._specs) { return false; }

        for (let i = 0; i < this._filters.length; i++) {
            let filter = this._filters[i];

            if (!filter.flag) { continue; }

            let
                appValue = p_app._specs[filter.coopid],
                pass = true;

            if (filter.values) {
                let selectedValue = filter.values[filter.selection];
                if (filter.check == _GRTR) { pass = appValue >= selectedValue; }
                else if (filter.check == _SMLR) { pass = appValue <= selectedValue; }
            } else {
                pass = appValue == "1";
            }

            if (!pass) { return false; }

        }

        return true;

    }

    _ReadCache(p_item) {
        let filter = this._map.Get(`${p_item.key}`);
        if (!filter) { return; }
        filter.flag = p_item.flag;
        filter.selection = p_item.selection;
    }

    _WriteCache(p_item) {
        return {
            key: p_item.key,
            flag: p_item.flag,
            selection: p_item.selection
        };
    }

}

module.exports = FilterGroupSpecs;