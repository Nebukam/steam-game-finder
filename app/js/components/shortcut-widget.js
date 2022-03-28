const nkm = require(`@nkmjs/core`);
const ui = nkm.ui;
const uilib = nkm.uilib;

class ShortcutWidget extends ui.Widget {
    constructor() { super(); }

    _Init(){
        super._Init();

    }

    _Style() {
        return nkm.style.Extends({
            ':host': {
                'display':'flex',
                'flex-flow':'column nowrap',
            },
            '.field-id':{
                'flex':'1 1 auto'
            },
            '.btn-add':{
                'flex':'0 0 auto'
            },
            '.line':{
                'width':'2px',
                'flex':'1 1 auto',
                'background-color':'#333333',
                'margin-left':'50%'
            }


        }, super._Style());
    }

    _Render(){
        super._Render();

        this._btn = this.Attach(uilib.buttons.Button, 'btn-add');
        this._btn.options = {
            //[ui.IDS.FLAVOR] : ui.FLAGS.CTA,
            [ui.IDS.VARIANT] : ui.FLAGS.FRAME,
            //[ui.IDS.ICON] : 'plus',
            trigger:{fn:this._OnClick, thisArg:this}
        }

        ui.dom.El(`div`, { class: `line` }, this);
        

    }

    set index(p_value){
        this._index = p_value;
        this._btn.label = `${p_value+1}`;
    }

    set mainView(p_value){
        this._mainView = p_value;
    }

    _OnClick(p_field, p_value){
        this._mainView._groups[this._index].scrollIntoView({ behavior: 'auto', block: 'start', inline: 'start' });
    }

    //#endregion

}

module.exports = ShortcutWidget;
ui.Register(`sgf-shortcut-widget`, ShortcutWidget);