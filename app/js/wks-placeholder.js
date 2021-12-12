const nkm = require(`@nkmjs/core`);
const u = nkm.utils;
const ui = nkm.ui;

class WorkspacePlaceholder extends ui.views.View {
    constructor() { super(); }

    _Style() {
        return nkm.style.Extends({
            ':host': {
                //'width':'350px'
            },
        }, super._Style());
    }

    _Render(){
        super._Render();
        new ui.manipulators.Text(u.El(`p`, {}, this)).Set(u.tils.CamelSplit(this.constructor.name));
    }

}

module.exports = WorkspacePlaceholder;