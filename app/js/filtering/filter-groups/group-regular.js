'use strict';

const nkm = require(`@nkmjs/core`);
const u = nkm.u;
const collections = nkm.collections;

const FilterGroup = require(`./filter-group`);

class FilterGroupRegular extends FilterGroup {

    constructor() { super(); }

    _Init() {
        super._Init();
        this._id = `filterlist`;

        this._Add({ key: 1, flag: false, id: `Multiplayer`, group:`Basics` });
        this._Add({ key: 2, flag: false, id: `Single Player`, group:`Basics` });
        //this._Add({ key: 49, flag: false, id: `PVP` });
        this._Add({ key: 37, flag: false, id: `PvP - Splitscreen`, label: `Splitscreen`, group:`PvP` });
        this._Add({ key: 47, flag: false, id: `PvP - LAN`, label: `LAN`, group:`PvP` });
        this._Add({ key: 36, flag: false, id: `PvP - Online`, label: `Online`, group:`PvP` });
        //this._Add({ key: 9, flag: false, id: `Co-op` });
        this._Add({ key: 39, flag: false, id: `Co-op - Splitscreen`, label: `Splitscreen`, group:`Co-op` });
        this._Add({ key: 48, flag: false, id: `Co-op - LAN`, label: `LAN`, group:`Co-op` });
        this._Add({ key: 38, flag: false, id: `Co-op - Online`, label: `Online`, group:`Co-op` });
        this._dlc = this._Add({ key: 21, flag: false, id: `DLC`, group:`Misc` });
        this._Add({ key: 20, flag: false, id: `MMO`, group:`Misc` });
        //this._Add({ key:27, flag: false, id:`cross_platform_mp`});
        //this._Add({ key:29, flag: false, id:`trading_cards`});
        //this._Add({ key:35, flag: false, id:`in_app_purchase`});
        //this._Add({ key:18, flag: false, id:`partial_controller_support`});
        //this._Add({ key:28, flag: false, id:`full_controller_support`});
        //this._Add({ key:22, flag: false, id:`achievements`});
        //this._Add({ key:22, flag: false, id:`steam_cloud`});
        //this._Add({ key:13, flag: false, id:`captions`});
        //this._Add({ key:42, flag: false, id:`remote_play_tablet`});
        //this._Add({ key:43, flag: false, id:`remote_play_tv`});
        this._Add({ key: 44, flag: false, id: `Remote play together`, group:`Misc` });
        //this._Add({ key:30, flag: false, id:`steam_workshop`});
        //this._Add({ key:32, flag: false, id:`steam_turn_notification`});

    }

    _Check(p_app) {

        if (!this._toggles.isBasicsEnabled) { return true; }

        let appFlags = p_app._flags;
        if (!appFlags) { return false; }
        if (appFlags.length == 0) { return false; }

        if(!this._dlc.flag && ( appFlags.includes(this._dlc.key) || p_app._parentGame)){ return false; }

        if (this._toggles.isExclusiveEnabled) {

            for (let i = 0; i < this._filters.length; i++) {
                let filter = this._filters[i];
                if (!filter.flag) { continue; }
                if (!appFlags.includes(filter.key)) { return false; }
            }

            return true;

        } else {

            for (let i = 0; i < this._filters.length; i++) {
                let filter = this._filters[i];
                if (!filter.flag) { continue; }
                if (appFlags.includes(filter.key)) { return true; }
            }

            return false;

        }

    }

    _ReadCache(p_item) {
        let filter = this._map.Get(`${p_item}`);
        if (!filter) { return; }
        filter.flag = true;
    }

    _WriteCache(p_item) {
        if (p_item.flag) { return p_item.key; }
        return null;
    }

}

module.exports = FilterGroupRegular;