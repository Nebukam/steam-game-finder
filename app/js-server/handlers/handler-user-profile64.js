'use strict';

const HandlerUserBase = require(`./base-user-handler`);

class HandlerUserProfile64 extends HandlerUserBase{
    constructor(){super();}

    Handle(){
        this.Fetch(`https://steamcommunity.com/profiles/${this._id}?xml=1`);
    }

}

module.exports = HandlerUserProfile64;