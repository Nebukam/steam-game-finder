const nkm = require(`@nkmjs/core`);
const u = nkm.utils;
const ui = nkm.ui;
const uiworkspace = nkm.uiworkspace;
const uilib = nkm.uilib;

const comps = require(`../components`);
const SIGNAL = require(`../data/signal`);

const RemoteDataBlock = require(`../data/remote-data-block`);

class UserListExplorer extends uiworkspace.Explorer {
    constructor() { super(); }

    _Init(){

        super._Init();

        this._usermap = new nkm.collections.Dictionary();

        nkm.env.APP.database.Watch(SIGNAL.USER_ADDED, this._OnUserAdded, this);
        nkm.env.APP.database.Watch(SIGNAL.USER_REMOVED, this._OnUserRemoved, this);
        nkm.env.APP.database.Watch(SIGNAL.USER_UPDATED, this._OnUserUpdated, this);
        nkm.env.APP.database.Watch(SIGNAL.INFOS_UPDATED, this._OnInfosUpdated, this);
    }

    _Style() {
        return nkm.style.Extends({
            ':host': {
                'width':'350px'
            },
            '.header, .footer':{
                'padding':'10px'
            },
            '.body': {
                'padding':'0px 8px 0px 4px'
            },
            '.user-card': {
                'margin-bottom':'4px',
                'width':'100%'
            },

            '.input-ctnr':{
                'display':'flex',
                'flex-flow':'row nowrap',
                //'padding':'10px'
            },
            '.field-id':{
                'flex':'1 1 auto'
            },
            '.btn-add':{
                'flex':'0 0 auto'
            }


        }, super._Style());
    }

    _Render(){
        super._Render();

        let inputCtnr = u.dom.El(`div`, { class:'input-ctnr'  }, this._header);

        this._inputField = this.Add(uilib.inputs.InputText, `field-id`, inputCtnr);
        this._inputField.placeholderValue = `Profile name, url, ...`;

        this._submitBtn = this.Add(uilib.buttons.Tool, 'btn-add', inputCtnr);
        this._submitBtn.options = {
            [ui.IDS.FLAVOR] : ui.FLAGS.CTA,
            //[ui.IDS.VARIANT] : ui.FLAGS.FRAME,
            [ui.IDS.ICON] : 'plus',
            trigger:{fn:this._OnInputSubmit, thisArg:this}
        }

        /*
        for(let i = 0; i < 13; i++){
            let card = this.Add(comps.UserCard, `user-card`);
            card.title = "Gamertag";
            card.subtitle = "Private profile";
            card.label = "{xxx} games in library";
        }
        */
        
        this._copyBtn = this.Add(uilib.buttons.Button, 'btn-copy', this._footer);
        this._copyBtn.options = {
            [ui.IDS.LABEL]:`Copy to clipboard`
        }

    }

    //#region user management
    
    _OnUserAdded(p_user){
        var ctrl = this._usermap.Get(p_user);
        if(ctrl){return;}
        ctrl = this.Add(comps.UserCard, `user-card`);
        ctrl.data = p_user;
        ctrl._friendsCallback = this._friendsCallback;
        this._usermap.Set(p_user, ctrl);
    }

    _OnUserRemoved(p_user){
        var ctrl = this._usermap.Get(p_user);
        if(!ctrl){return;}
        this._usermap.Remove(p_user);
        ctrl.Release();
    }

    _OnUserUpdated(p_user){
        this._OnInfosUpdated();
    }

    //#endregion

    //#region infos
    _OnInfosUpdated(){

        var statusText = `Add some users to start !`;
        var substatus = ``;
        this._submitBtn.visible = false;

        switch(nkm.env.APP.database._userStatuses){

            case RemoteDataBlock.STATE_NONE:
            case RemoteDataBlock.STATE_INVALID:
                statusText = `Need some more valid profiles...`;
                break;
            case RemoteDataBlock.STATE_LOADING:
                statusText = `Loading...`;
                break;
            case RemoteDataBlock.STATE_READY:

                var l = nkm.env.APP.database._currentOverlap.length;                
                substatus = `${l} products in common`;
                
                var m = nkm.env.APP.database._filteredCount;
                if(m > 0){ statusText = `${m} games matches filters`; }
                else{ statusText = `0 games matches filters`; }                

                //this._submitBtn.visible = (l != 0);
                break;
            case RemoteDataBlock.STATE_INVALID:
                statusText = `Something went wrong`;
                break;

        }

        if(nkm.env.APP._DB._userMap.count == 0){
            statusText = `Add users here`;
        }

        //this._subStatusLabel.text = substatus;
        //this._statusLabel.text = statusText;

    }

    //#endregion

    //#region user input

    _OnInputSubmit(p_field, p_value){
        //this._inputField.currentValue = p_value;
        console.log("current input = "+this._inputField.currentValue);
    }

    _CreateNewFromInputValue(){

        try{
            
            var playerid = this._inputField.currentValue;

            if(this._ReadJSONList(playerid)){
                this._inputField.currentValue = ``;
                return;
            }

            if(playerid == ``){ return; }

            if(playerid.includes(`.com/profiles`)){
                playerid = playerid.split(`.com/profiles/`)[1];
                var fs = playerid.split(`/`);
                if(fs.length >1){ playerid = fs[0]; }
            }else if(playerid.includes(`.com/id`)){
                playerid = playerid.split(`.com/id/`)[1];
                var fs = playerid.split(`/`);
                if(fs.length >1){ playerid = fs[0]; }
            }

            if(playerid == ``){ return; }

            
            ENV.APP._DB.GetUser(playerid);
            this._inputField.currentValue = ``;

        }catch(e){
            this._inputField.currentValue = ``;
        }
    }

    
    _InitSearch(){
        //window.open("steam://url/SteamIDMyProfile");
        this._submitCallback.call();
    }
    
    _LoadStoredUserList(result){
        if(result.userlist != ``){
            this._ReadJSONList(result.userlist);
        }
    }

    _ReadJSONList(p_json){
        try{
            var uList = JSON.parse(p_json);
            if(!Array.isArray(uList)){ return false; }
            for(var i = 0, n = uList.length; i < n; i++){
                if(uList[i].id == ``){ continue; }
                ENV.APP._DB.GetUser(uList[i].id, uList[i].active);
            }
            return true;
        }catch(e){
            return false;
        }
    }

    //

    _CopyUsersToClipboard(){
        navigator.clipboard.writeText(ENV.APP._DB._GetUserJSONData());
    }

    //#endregion

}

module.exports = UserListExplorer;
ui.Register(`sgf-userlist`, UserListExplorer);