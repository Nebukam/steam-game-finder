const nkm = require(`@nkmjs/core`);
const u = nkm.utils;
const ui = nkm.ui;
const inputs = nkm.inputs;

class MainShelfPlaceholder extends ui.views.View {
    constructor() { super(); }

    _Init() {
        super._Init();

    }

    _Style() {
        return nkm.style.Extends({
            ':host': {
                'width':'350px',
                'padding':'50px'
            },
        }, super._Style());
    }

    _Render(){
        super._Render();
        new ui.manipulators.Text(u.El(`p`, {}, this)).Set(u.tils.CamelSplit(this.constructor.name));
        this.Add(inputs.InputFile);
    }

    _CheckDrop(p_data) {
        console.log(`_CheckDrop`, p_data);
        return true;
    }

    _Drop(p_data) {
        console.log(`_Drop`, p_data);
    }

}

module.exports = MainShelfPlaceholder;
ui.Register(`toolbox-main-shelf-placeholder`, MainShelfPlaceholder);