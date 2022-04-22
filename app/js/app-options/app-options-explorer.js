const nkm = require(`@nkmjs/core`);
const u = nkm.u;
const ui = nkm.ui;

const base = nkm.uiworkspace.Explorer;
class AppOptionsExplorer extends base {
    constructor() { super(); }

    static _Style() {
        return nkm.style.Extends({
            ':host': {
                'width':'350px'
            },
        }, base._Style());
    }

    _Render(){
        super._Render();
        new ui.manipulators.Text(ui.dom.El(`p`, {}, this._header)).Set(u.tils.CamelSplit(this.constructor.name));
    }

}

module.exports = AppOptionsExplorer;