const { ElectronBase } = require(`@nkmjs/core/lib/core-electron`).electron;

class ElectronProcess extends ElectronBase{
    constructor(p_config){super(p_config);}

    _Boot(){
        super._Boot();
        // At that point, the main window is loaded and ready
    }

}

module.exports = ElectronProcess;