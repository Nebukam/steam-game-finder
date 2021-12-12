const nkm = require(`@nkmjs/core`);
const u = nkm.utils;
const ui = nkm.ui;

const MainShelfPlaceholder = require(`./main-shelf-placeholder`);

class MainShelf extends nkm.uilib.views.Shelf {
    constructor() { super(); }

    _Init() {
        super._Init();
        //this._placholderViewClass = MainShelfPlaceholder;
    }

    _Style() {
        return nkm.style.Extends({
            ':host': {
                
            }
        }, super._Style());
    }


}

module.exports = MainShelf;
ui.Register(`toolbox-main-shelf`, MainShelf);