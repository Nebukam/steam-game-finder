/*const nkm = require(`@nkmjs/core`);*/
const com = nkm.com;
const ui = nkm.ui;
const uilib = nkm.uilib;

class FilterWidget extends uilib.inputs.Boolean {
    constructor() { super(); }

    _Init() {
        super._Init();

        this._updateFn = null;

        this._flavor = new ui.helpers.FlagEnum(ui.FLAGS.flavorsExtended, true);
        this._flavor.Add(this);
        this._flavor.Set(ui.FLAGS.CTA);

        this._handler.Watch(ui.inputs.SIGNAL.VALUE_SUBMITTED, this._OnToggle, this);

    }

    _Style() {
        return nkm.style.Extends({
            ':host': {
                'transition': 'opacity 0.5s',
                'border-radius': `3px`,
                'padding': '5px',
                'background-color': 'rgba(140, 140, 140, 0.15)'
            },
            ':host(.checked)': {
                'background-color': 'var(--flavor-primary-idle)',
                'font-weight': '900',

            }
        }, super._Style());
    }

    set sourceEnum(p_value) {
        this._sourceEnum = p_value;
        this.label = (p_value.label || p_value.id);
        this.currentValue = p_value.flag;
    }

    _OnToggle(p_input, p_value) {
        this._sourceEnum.flag = p_value;
        this._sourceEnum._updateFn();
    }

}

module.exports = FilterWidget;
ui.Register(`sgf-filter-widget`, FilterWidget);