'use strict';

const HandlerUserBase = require(`./base-user-handler`);

class HandlerUserLibrary extends HandlerUserBase{
    constructor(){super();}

    Handle(){
        this.Fetch(`https://steamcommunity.com/profiles/${this._request.params.id}/games/?tab=all`);
    }

}

module.exports = HandlerUserLibrary;