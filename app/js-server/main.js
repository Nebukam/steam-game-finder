const server = require(`@nkmjs/core/server`);

const __api_get_user = `get_user`;
const __api_get_friendlist = `get_friendlist`;
const __api_get_library = `get_library`;

class ServerProcess extends server.core.ServerBase{
    constructor(p_config){super(p_config);}

    _Init(){
        super._Init();
        this._apis = {
            [__api_get_user]:{
                route:`/user/:id`
            },
            [__api_get_friendlist]:{
                route:`/friendlist/:id`
            },
            [__api_get_library]:{
                route:`/library/:id`
            }
        }
    }

    _Boot(){
        super._Boot();
    }

}

module.exports = ServerProcess;