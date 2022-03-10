'use strict';

/*const nkm = require(`@nkmjs/core`);*/
const u = nkm.utils;
const collections = nkm.collections;

const FilterGroup = require(`./filter-group`);

class FilterGroupOverlap extends FilterGroup {

    constructor() { super(); }

    _Init() {
        super._Init();
        this._id = `player-overlap`;


        // Listen DB for user update
    }

    _Check(p_app) {

        let
            playerlist = nkm.env.APP.database._userReadyList,
            pass = true,
            activeUserCount = 0;

        for (let i = 0; i < playerlist.count; i++) {
            let user = playerlist.At(i);
            if (!p_app._users.includes(user)) {
                pass = false;
            }else{
                activeUserCount++;
            }
        }
        
        p_app.activeUserCount = activeUserCount;
        p_app.passOverlap = pass;
        return pass;

    }

}

module.exports = FilterGroupOverlap;