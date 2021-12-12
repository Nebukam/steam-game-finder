const nkm = require(`@nkmjs/core`);
const u = nkm.utils;
const ui = nkm.ui;

class WelcomeView extends ui.views.View {
    constructor() { super(); }

    _Init() {
        super._Init();
    }

    _Style() {
        return nkm.style.Extends({
            ':host': {
                
            }
        }, super._Style());
    }

    _Cleanup(){
        super._Cleanup();
        console.log(`Cleanup !`);
    }

}

module.exports = WelcomeView;
ui.Register(`toolbox-welcome`, WelcomeView);