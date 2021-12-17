'use strict';

const HandlerUserBase = require(`./base-user-handler`);

class HandlerUserFriendlist extends HandlerUserBase{
    constructor(){super();}

    Handle(){
        this.Fetch(`https://steamcommunity.com/profiles/${this._request.params.id}/friends`);
    }

}

module.exports = HandlerUserFriendlist;