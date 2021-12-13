const nkm = require(`@nkmjs/core`);
const u = nkm.utils;
const ui = nkm.ui;
const uiworkspace = nkm.uiworkspace;
const uilib = nkm.uilib;

class GameCard extends uilib.cards.Media {
    constructor() { super(); }

    _Init(){
        super._Init();
        this._orientation.Set(ui.FLAGS.VERTICAL);
        this._mediaPlacement.Set(ui.FLAGS.TOP);
    }

    _Style() {
        return nkm.style.Extends({
            ':host': {
                'width':'150px',
                '--header-size':'200px'
                //margin:'10px'
            },
        }, super._Style());
    }

    _Render(){
        super._Render();
        //new ui.manipulators.Text(u.El(`p`, {}, this._header)).Set(u.tils.CamelSplit(this.constructor.name));

    }


    // TODO : 
    // A project is loaded : check folders based on project location
    //      no folder : offer to create one based on default NKM locale
    //      existing folers : regular thing
    // A project is not loaded : display that a project should be loaded first

}

module.exports = GameCard;
ui.Register(`sgf-gamecard`, GameCard);