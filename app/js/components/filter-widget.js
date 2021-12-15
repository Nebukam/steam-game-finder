const nkm = require(`@nkmjs/core`);
const RemoteDataBlock = require("../data/remote-data-block");
const u = nkm.utils;
const ui = nkm.ui;
const uiworkspace = nkm.uiworkspace;
const uilib = nkm.uilib;

const __flag_toggled = `toggled`;
const __flag_notused = `not-used`;

class FilterWidget extends ui.Widget {
    constructor() { super(); }

    static __usePaintCallback = true;

    _Init() {
        super._Init();
        this._flags.Add(this, __flag_toggled, __flag_notused);
    }

    _OnPaintChange() {
        super._OnPaintChange();

        if(this._isPainted){
            this.style.opacity = 1;
        }else{
            this.style.opacity = 0;
        }
    }

    _Style() {
        return nkm.style.Extends({
            ':host': {
                'opacity':0,
                'transition': 'opacity 0.5s',
                'height':'30px',
                'position':`relative`,
                'display':'flex',
                'flex-flow':'row nowrap',
                'border-radius':`30px`,
                'padding': '4px',
                'padding-left': '30px',
                'padding-right': '10px',
                'font-weight': '900'
            },
            ':host(.toggled)': {
                'background':'var(--fcol-10-0-i)'
            },
            '.toggle': {
                'flex':'1 1 auto'
            },
            ':host(.not-used)':{
                'opacity':'0.2 !important'
            }
        }, super._Style());
    }

    set sourceEnum(p_value){
        this._sourceEnum = p_value;
        this._toggle.label = p_value.id;
        this.toggle = p_value.flag;
    }

    set toggle(p_value){
        this._toggle.currentValue = p_value;
        this._sourceEnum.flag = p_value;
        this._flags.Set(__flag_toggled, p_value);
    }

    _Render() {
        super._Render();
        this._toggle = this.Add(uilib.inputs.Boolean, `toggle`);
        this._toggle.handler.Watch(ui.inputs.SIGNAL.VALUE_SUBMITTED, this._OnToggleUserActivation, this); 
    }

    _OnToggleUserActivation(p_input, p_value) {
        this.toggle = p_value;
        nkm.env.APP.database._UpdateFilters();
    }

}

module.exports = FilterWidget;
ui.Register(`sgf-filter-widget`, FilterWidget);