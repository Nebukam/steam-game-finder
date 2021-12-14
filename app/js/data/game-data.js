'use strict';
const nkm = require(`@nkmjs/core`);

const RemoteDataBlock = require("./remote-data-block");

class GameData extends RemoteDataBlock{

    constructor() { super(); }

    _Init(){
        super._Init();

        this._rscType = nkm.io.resources.JSONResource;

        this._appid = "";
        this._parentGame = null;
        this._flags = null;
        this._tags = null;
        this._users = new Array();
        this._childs = new Array();

        this._name = ``;
        this._logo = ``;

        this._shouldShow = false;
        
    }

    get shouldShow(){ return this._shouldShow; }
    set shouldShow(p_value){ this._shouldShow = p_value; }

    get usercount(){ return this._users.length; }

    get appid(){ return this._appid; }
    set appid(p_value){ 
        this._appid = p_value;
        this._dataPath = `https://nebukam.github.io/steam/app/${this._appid}/infos.json`;
    }

    get name(){ return this._name; }
    set name(p_value){ 
        if(this._name == p_value){return;}
        this._name = p_value;
        this.CommitUpdate();
    }

    get logo(){ return this._logo; }
    set logo(p_value){ 
        if(this._logo == p_value){return;}
        this._logo = p_value;
        this.CommitUpdate();
    }



    /////

    HasFlags(p_flags, p_any = true){

        if(!this.isReady){ return false; }

        let flag = null;
        let count = p_flags.length;
        let matchCount = 0;
        for(let i = 0, n = count; i < n; i++){
            if(this._flags.includes(p_flags[i])){ matchCount++; }
        }

        if(p_any){ return matchCount > 0; }
        else{ return matchCount == count; }

    }

    HasTags(p_tags, p_any = true){
        
        if(!this.isReady){ return false; }
        
        let tag = null;
        let count = p_tags.length;
        let matchCount = 0;
        for(let i = 0, n = count; i < n; i++){
            tag = p_tags[i];
            for(let j = 0, n = this._tags.length; j < n; j++){
                if(this._flags[i] == tag){ matchCount++; }
            }
        }

        if(p_any){ return matchCount > 0; }
        else{ return matchCount == count; }

    }

    /////

    _OnLoadRequestSuccess(p_rsc){

        this._flags = p_rsc.content.flags;
        this._tags = p_rsc.content.tags;

        let parentID = p_rsc.content.parentappid;
        if(parentID != ``){
            this._parentGame = nkm.env.APP.database.GetGame(parentID);
            this._parentGame.AddChild(this);
        }

        super._OnLoadRequestSuccess(p_rsc);
    }

    AddChild(p_game){
        if(!this._childs.includes(p_game)){ 
            this._childs.push(p_game);
        }
    }

    /////

    AddUser(p_user){
        let index = this._users.indexOf(p_user);
        if(index == -1){ this._users.push(p_user); }
    }

    RemoveUser(p_user){
        let index = this._users.indexOf(p_user);
        if(index != -1){ this._users.splice(index, 1); }
    }

    _CleanUp(){
        super._CleanUp();
    }

}

module.exports = GameData;