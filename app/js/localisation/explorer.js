const nkm = require(`@nkmjs/core`);
const u = nkm.utils;
const ui = nkm.ui;
const uiworkspace = nkm.uiworkspace;

class LocalisationExplorer extends uiworkspace.Explorer {
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
        new ui.manipulators.Text(u.El(`p`, {}, this._header)).Set(u.tils.CamelSplit(this.constructor.name));
    }

    // TODO : 
    // A project is loaded : check folders based on project location
    //      no folder : offer to create one based on default NKM locale
    //      existing folers : regular thing
    // A project is not loaded : display that a project should be loaded first

}

module.exports = LocalisationExplorer;