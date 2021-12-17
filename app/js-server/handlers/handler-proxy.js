'use strict';

const HandlerUserBase = require(`./base-user-handler`);

class HandlerUserProfile extends HandlerUserBase{
    constructor(){super();}
    Handle(){ this.Fetch(this._request.params.url); }
}

module.exports = HandlerUserProfile;