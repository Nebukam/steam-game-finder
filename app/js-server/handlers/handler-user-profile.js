'use strict';

const HandlerUserBase = require(`./base-user-handler`);

class HandlerUserProfile extends HandlerUserBase{
    constructor(){super();}

    Handle(){
        this.Fetch(`https://steamcommunity.com/id/${this._id}?xml=1`);
    }

}

module.exports = HandlerUserProfile;