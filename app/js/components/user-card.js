const nkm = require(`@nkmjs/core`);
const u = nkm.utils;
const ui = nkm.ui;
const uiworkspace = nkm.uiworkspace;
const uilib = nkm.uilib;

class UserCard extends uilib.cards.Media {
    constructor() { super(); }

    static __default_headerPlacement = ui.FLAGS.LEFT;

    _Init(){
        super._Init();
        //this._itemDataObserver.Hook(SIGNAL.STATE_CHANGE, )
    }

    _Style() {
        return nkm.style.Extends({
            ':host': {
                //'width':'350px'
                //margin:'10px'
                '--header-size':'100px'
            },
        }, super._Style());
    }

    _Render(){
        super._Render();
        //new ui.manipulators.Text(u.El(`p`, {}, this._header)).Set(u.tils.CamelSplit(this.constructor.name));
    }

    
    _OnDataUpdated(p_data) {

        super._OnDataUpdated(p_data);
        
        this.media = p_data._avatarURL;
        this.title = p_data._personaID;
        this.subtitle = `${p_data.gamesCount} games in library`;
        this.label = p_data._privacy;        

    }

}

module.exports = UserCard;
ui.Register(`sgf-usercard`, UserCard);