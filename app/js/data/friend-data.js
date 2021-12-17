'use strict';

const nkm = require(`@nkmjs/core`);
const u = nkm.utils;
const io = nkm.io;

const RemoteDataBlock = require("./remote-data-block");

//const axios = require('axios');

class FriendData extends nkm.data.DataBlock {

    constructor() { super(); }

    _Init() {

        super._Init();

        this._existingUser = null;

        this._profileID64 = "";
        this._personaID = "";
        this._avatarURL = "";
        this._privacy = "";

    }

    get existingUser() { return this._existingUser; }
    set existingUser(p_value) {

        if (this._existingUser == p_value) { return; }

        let oldUser = this._existingUser;

        if(oldUser){
            oldUser.Unwatch(nkm.com.SIGNAL.RELEASED, this._OnExistingReleased, this);
        }

        this._existingUser = p_value;

        if(this._existingUser){
            this._existingUser.Watch(nkm.com.SIGNAL.RELEASED, this._OnExistingReleased, this);
        }

        this.CommitUpdate();
    }

    _OnExistingReleased(){
        this.existingUser = null;
    }

    // Second profile fetch

    _CleanUp() {
        this.existingUser = null;
        this._profileID64 = "";
        this._personaID = "";
        this._avatarURL = "";
        this._privacy = "";

        super._CleanUp();
    }


}

module.exports = FriendData;