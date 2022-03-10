/*const nkm = require(`@nkmjs/core`);*/
const u = nkm.utils;
const ui = nkm.ui;

class AppOptionsExplorer extends nkm.uiworkspace.Explorer {
    constructor() { super(); }

    _Style() {
        return nkm.style.Extends({
            ':host': {
                'width':'350px'
            },
        }, super._Style());
    }

    _Render(){
        super._Render();
        new ui.manipulators.Text(ui.dom.El(`p`, {}, this._header)).Set(u.tils.CamelSplit(this.constructor.name));
    }

}

module.exports = AppOptionsExplorer;