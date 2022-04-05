'use strict';

const nkm = require(`@nkmjs/core`);
const u = nkm.u;
const collections = nkm.collections;

const FilterGroup = require(`./filter-group`);

const _GRTR = `>=`;
const _SMLR = `<=`;

class FilterGroupCooptimus extends FilterGroup {

    constructor() { super(); }

    _Init() {
        super._Init();
        this._id = `filterlist-cooptimus`;

        let localValues = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12];
        let onlineValues = [0, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 14, 16, 20, 24, 26, 30, 32, 35, 64, 100, 255, 500];
        let lanValues = [0, 2, 3, 4, 5, 6, 7, 8, 10, 11, 12, 14, 16, 20, 24, 30, 32, 35, 64, 255, 256, 500];

        this._Add({
            key: 1, flag: false, id: `Max local`, label: `At least %s players`, group:`Local`,
            values: localValues, selection: 0, coopid: `local`, check: _GRTR
        });
        this._Add({
            key: 2, flag: false, id: `Min local`, label: `At most %s players`, group:`Local`,
            values: localValues, selection: localValues.length - 1, coopid: `local`, check: _SMLR
        });

        this._Add({
            key: 3, flag: false, id: `Max online`, label: `At least %s players`, group:`Online`,
            values: onlineValues, selection: 0, coopid: `online`, check: _GRTR
        });
        this._Add({
            key: 4, flag: false, id: `Min online`, label: `At most %s players`, group:`Online`,
            values: onlineValues, selection: onlineValues.length - 1, coopid: `online`, check: _SMLR
        });

        this._Add({
            key: 5, flag: false, id: `Max lan`, label: `At least %s players`, group:`LAN`,
            values: lanValues, selection: 0, coopid: `lan`, check: _GRTR
        });
        this._Add({
            key: 6, flag: false, id: `Min lan`, label: `At most %s players`, group:`LAN`,
            values: lanValues, selection: lanValues.length - 1, coopid: `lan`, check: _SMLR
        });

        //this._Add({ key: 7, flag: false, id: `Splitscreen`, coopid: `splitscreen`, group:`Misc` });
        this._Add({ key: 8, flag: false, id: `Drop-in/Drop-out`, coopid: `dropindropout`, group:`Misc` });
        this._Add({ key: 9, flag: false, id: `Co-op Campaign`, coopid: `campaign`, group:`Misc` });

    }

    _Check(p_app) {

        if (!this._toggles.isCooptimusEnabled) { return true; }
        if (!p_app._cooptimus) { return false; }

        for (let i = 0; i < this._filters.length; i++) {
            let filter = this._filters[i];

            if (!filter.flag) { continue; }

            let
                appValue = p_app._cooptimus[filter.coopid],
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

module.exports = FilterGroupCooptimus;