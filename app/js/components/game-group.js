const nkm = require(`@nkmjs/core`);
const ui = nkm.ui;
const uilib = nkm.uilib;

class GamesGroup extends ui.DisplayObjectContainer {
    constructor() { super(); }

    _Init(){
        super._Init();

    }

    _Style() {
        return nkm.style.Extends({
            ':host': {
                'display':'flex',
                'flex-flow':'row nowrap',
            },
            '.field-id':{
                'flex':'1 1 auto'
            },
            '.btn-add':{
                'flex':'0 0 auto'
            }


        }, super._Style());
    }

    _Render(){
        super._Render();
    }

}

module.exports = GamesGroup;
ui.Register(`sgf-gamegroup`, GamesGroup);