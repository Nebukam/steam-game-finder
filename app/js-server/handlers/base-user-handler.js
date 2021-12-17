'use strict';

const server = require(`@nkmjs/core/server`).core;

class HandlerUserBase extends server.handlers.Fetch{
    constructor(){super();}

    _OnFetchSuccess(p_response){
        this._response.send(p_response.data);
        super._OnFetchSuccess(p_response);
    }

}

module.exports = HandlerUserBase;