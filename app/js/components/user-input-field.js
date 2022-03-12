const nkm = require(`@nkmjs/core`);
const ui = nkm.ui;
const uilib = nkm.uilib;

class UserInputField extends ui.DisplayObjectContainer {
    constructor() { super(); }

    _Init(){
        super._Init();

    }

    _Style() {
        return nkm.style.Extends({
            ':host': {
                'display':'flex',
                'flex-flow':'row nowrap',
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

        this._inputField = this.Add(uilib.inputs.Text, `field-id`);
        this._inputField.placeholderValue = `Profile name, url, ...`;
        this._inputField.handler.Watch(ui.inputs.SIGNAL.VALUE_SUBMITTED, this._OnInputSubmit, this);

        this._submitBtn = this.Add(uilib.buttons.Tool, 'btn-add');
        this._submitBtn.options = {
            [ui.IDS.FLAVOR] : ui.FLAGS.CTA,
            //[ui.IDS.VARIANT] : ui.FLAGS.FRAME,
            [ui.IDS.ICON] : 'plus',
            trigger:{fn:()=>{this._inputField.handler.SubmitValue()}, thisArg:this}
        }

    }

    _OnInputSubmit(p_field, p_value){

        let inputValue = this._inputField.currentValue;

        try{
            
            if(this._ReadJSONList(inputValue)){
                this._inputField.currentValue = ``;
                return;
            }

            if(inputValue == ``){ return; }

            let playerid = inputValue;

            if(inputValue.includes(`.com/profiles`)){
                playerid = inputValue.split(`.com/profiles/`)[1];
                var fs = playerid.split(`/`);
                if(fs.length >1){ playerid = fs[0]; }
            }else if(inputValue.includes(`.com/id`)){
                playerid = inputValue.split(`.com/id/`)[1];
                var fs = playerid.split(`/`);
                if(fs.length >1){ playerid = fs[0]; }
            }

            if(playerid == `` || playerid.length > 64){ return; } //steam limit IDs to 64 chars

            nkm.env.APP.database.GetUser(playerid);
            this._inputField.currentValue = ``;

        }catch(e){
            console.log(e);
            this._inputField.currentValue = ``;
        }
    }

    _ReadJSONList(p_json){
        try{
            var uList = JSON.parse(p_json);
            if(!Array.isArray(uList)){ return false; }
            for(var i = 0, n = uList.length; i < n; i++){
                if(uList[i].id == ``){ continue; }
                nkm.env.APP.database.GetUser(uList[i].id, uList[i].active);
            }
            return true;
        }catch(e){
            return false;
        }
    }

    _InitSearch(){
        //window.open("steam://url/SteamIDMyProfile");
        this._submitCallback.call();
    }

    //#endregion

}

module.exports = UserInputField;
ui.Register(`sgf-userinputfield`, UserInputField);