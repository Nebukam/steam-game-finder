/*const nkm = require(`@nkmjs/core`);*/
const com = nkm.com;
const ui = nkm.ui;
const uilib = nkm.uilib;

class SliderFilterWidget extends ui.Widget {
    constructor() { super(); }

    _Init() {
        super._Init();

        this._updateFn = null;

        this._flavor = new ui.helpers.FlagEnum(ui.FLAGS.flavorsExtended, true);
        this._flavor.Add(this);
        this._flavor.Set(ui.FLAGS.CTA);

        this._flags.Add(this, `checked`);
    }

    _Style() {
        return nkm.style.Extends({
            ':host': {
                'transition': 'opacity 0.5s',
                'border-radius': `3px`,
                'padding': '5px',
                'background-color': 'rgba(140, 140, 140, 0.15)',
                'display': 'flex',
                'flex-flow': 'row wrap',
                'align-items': 'center',
                'align-content': 'flex-start'
            },
            '.toggle': {                
                'flex': '1 1 100%'
            },
            '.slider': {
                'display':'none',
                'flex': '1 1 auto',
                'margin-top':'4px'
            },

            ':host(.checked) .slider':{
                'display':'inline-flex'
            },
            '.label-value': {
                'flex': '0 0 25px',
                'text-align': 'right',
                'font-weight': '400',
                'margin-right': '4px',
                'user-select': 'none'
            },
            ':host(.checked)': {
                'background-color': 'var(--flavor-primary-idle)',
                //'font-weight': '900',

            }
        }, super._Style());
    }

    _Render() {
        super._Render();

        this._toggle = this.Add(uilib.inputs.Boolean, `toggle`, this);
        this._toggle.size = ui.FLAGS.SIZE_XS;
        this._selector = this.Add(uilib.inputs.SliderOnly, `slider`, this);
        this._selector.size = ui.FLAGS.SIZE_XS;
        //this._label = new ui.manipulators.Text(ui.dom.El(`div`, { class: `label-value` }, this));

        this._toggle._handler.Watch(ui.inputs.SIGNAL.VALUE_SUBMITTED, this._OnToggle, this);
        this._selector._handler.Watch(ui.inputs.SIGNAL.VALUE_SUBMITTED, this._OnSlider, this);

    }

    set sourceEnum(p_value) {

        this._sourceEnum = p_value;

        this._toggle.label = (p_value.label || p_value.id);
        this._toggle._handler.currentValue = p_value.flag;

        this._selector.options = { min: 0, max: p_value.values.length - 1, step: 1 };
        this._selector._handler.currentValue = p_value.selection;
        
        this._toggle.label = this._parse((this._sourceEnum.label || this._sourceEnum.id), this._sourceEnum.values[this._sourceEnum.selection]);

        this._flags.Set(`checked`, p_value.flag);
    }

    _OnToggle(p_input, p_value) {
        this._flags.Set(`checked`, p_value);
        this._sourceEnum.flag = p_value;
        this._sourceEnum._updateFn();
    }

    _OnSlider(p_input, p_value) {
        this._toggle.label = this._parse((this._sourceEnum.label || this._sourceEnum.id), this._sourceEnum.values[p_value]);
        //this._label.Set(`${this._sourceEnum.values[p_value]}`);
        this._sourceEnum.selection = p_value;
        this._sourceEnum._updateFn();
    }

    _parse(str, ...args) {
        var i = 0;
    
        return str.replace('%s', () => `<b>${args[i++]}</b>`);
    }

}

module.exports = SliderFilterWidget;
ui.Register(`sgf-slider-filter-widget`, SliderFilterWidget);