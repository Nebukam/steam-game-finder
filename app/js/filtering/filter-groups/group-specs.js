'use strict';

/*const nkm = require(`@nkmjs/core`);*/
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

        let localValues = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,54,55,56,57,58,59,60,61,62,64,65,67,68,70,72,74,75,80,83,85,88,90,100,103,105,110,115,120,123,130,150,155,180,200,230,250,256,258,300,400,410,458,500,550,600,700,800,933,1500,1984,2200,3072,8232,9000];

        this._Add({
            key: 1, flag: false, id: `Min size`, label: `At least %s GBs`, group:`Storage size`,
            values: localValues, selection: 0, coopid: `storage`, check: _GRTR
        });

        this._Add({
            key: 1, flag: false, id: `Max size`, label: `At most %s GBs`, group:`Storage size`,
            values: localValues, selection: localValues.length - 1, coopid: `storage`, check: _SMLR
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