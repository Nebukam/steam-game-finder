'use strict';

const server = require(`@nkmjs/core/server`).core;

class HandlerUserBase extends server.handlers.Fetch{
    constructor(){super();}

    _SanitizeRequest(p_request){
        if(!p_request.params.id){ return false; }
        if(p_request.params.id == ``){ return false; }
        this._id = p_request.params.id;
        return true;
    }

    _OnFetchSuccess(p_response){
        this._res.send(p_response.data);
        super._OnFetchSuccess(p_response);
    }

}

module.exports = HandlerUserBase;