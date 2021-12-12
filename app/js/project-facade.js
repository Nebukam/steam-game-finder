const nkm = require(`@nkmjs/core`);
const com = nkm.common;
const u = nkm.utils;
const ui = nkm.ui;
const data = nkm.data;

/**
 * A project facade is a data object created from a package.json and/or an nkmjs.config.json
 * It allow the app to retrieve and edit important bits
 */
class NKMProjectFacade extends com.pool.DisposableObjectEx {
    constructor() { super(); }

    _Style() {
        return nkm.style.Extends({
            ':host': {
                'width':'350px'
            },
        }, super._Style());
    }

}

module.exports = NKMProjectFacade;