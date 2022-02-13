'use strict';

/**
 * @description TODO
 * @class
 * @hideconstructor
 * @memberof ui.core
 */
class SIGNAL {
    constructor() { }

    static STATE_CHANGED = Symbol(`state-changed`);

    static USER_ADDED = Symbol(`user-added`);
    static USER_REMOVED = Symbol(`user-removed`);
    static USER_UPDATED = Symbol(`user-updated`);

    static USER_READY_ADDED = Symbol(`user-ready_added`);
    static USER_READY_REMOVED = Symbol(`user-ready_removed`);
    static USER_READY_UPDATED = Symbol(`user-ready-updated`);

    static GAME_ADDED = Symbol(`game-added`);
    static GAME_REMOVED = Symbol(`game-removed`);
    static GAME_UPDATED = Symbol(`game-updated`);

    static INFOS_UPDATED = Symbol(`infos-updated`);
    static FILTERS_UPDATED = Symbol(`filters-updated`);

    static TAG_UPDATED = Symbol(`tag-updated`);

}

module.exports = SIGNAL;