const nkm = require(`@nkmjs/core`);
const RemoteDataBlock = require("../data/remote-data-block");
const u = nkm.utils;
const ui = nkm.ui;
const uiworkspace = nkm.uiworkspace;
const uilib = nkm.uilib;

const _flag_noProfile = 'no-profile';

class FriendCard extends uilib.cards.Media {
    constructor() { super(); }

    static __default_headerPlacement = ui.FLAGS.LEFT;
    static __usePaintCallback = true;

    _Init() {
        super._Init();
        
        this._Bind(this._OnToggleUserActivation);
        this._Bind(this._OnLogoLoadSuccess);
        this._Bind(this._OnLogoLoadError);

        this._flags.Add(this, _flag_noProfile);
    }

    _OnPaintChange() {
        super._OnPaintChange();

        if(this._isPainted){
            this.style.opacity = 1;
        }else{
            this.style.opacity = 0;
        }
    }

    _Style() {
        return nkm.style.Extends({
            ':host': {
                'opacity':0,
                'transition': 'opacity 0.5s',
                'height':'55px',
                //margin:'10px'
                '--header-size': '55px'
            },
            '.header': {
                'width':'var(--header-size)',
                'min-height':'var(--header-size)',
                'min-width':'var(--header-size)',
            },
            '.body': {
                'padding-bottom': '0px'
            },
            '.body .title': {
                'padding-right': '12px',
            },
            ':host(.no-profile)': {
                //'height':'80px',
                //margin:'10px'
            },
            ':host(.no-profile) .header': {
                //'height':'80px',
                'opacity':0.5
            },
            '.btn-delete': {
                'position': 'absolute',
                'top': '18px',
                'right': '18px',
                '--size': 'var(--size-xs)'
            }
        }, super._Style());
    }

    _Render() {
        super._Render();
        this._frame[ui.IDS.TITLE].ellipsis = true;
        this._deleteBtn = this.Add(uilib.buttons.Tool, `btn-delete`);
        this._deleteBtn.options = {
            htitle: `Delete`, icon: 'close-small',
            trigger: { fn: this._Bind(this._DeleteUserEntry) },
            variant: ui.FLAGS.MINIMAL
        }

        this.subtitle = `hahah`;
    }

    _OnDataChanged(p_oldData){
        super._OnDataChanged(p_oldData);
        if(this._data){
            nkm.io.Read(this._data._avatarURL,
                { cl: nkm.io.resources.BlobResource },
                {
                    success: this._OnLogoLoadSuccess,
                    error: this._OnLogoLoadError,
                    parallel:true
                });
        }
    }

    _OnDataUpdated(p_data) {

        super._OnDataUpdated(p_data);
        this.title = p_data._personaID;
        this.subtitle = null;
        this.label = null;

        if(p_data.existingUser){
            this.flavor = nkm.ui.FLAGS.CTA;
            this._deleteBtn.visible = true;
        }else{
            this.flavor = null;
            this._deleteBtn.visible = false;
        }
    }

    _OnToggleUserActivation(p_input, p_value) {
        this._data.active = p_value;
    }

    Activate(p_evt){
        if(!super.Activate(p_evt) || this._data.existingUser || this._deleteBtn._pointer.isMouseOver ){ return false; }
        this._data.existingUser = nkm.env.APP.database.GetUser(this._data._profileID64);
        return true;
    }

    _DeleteUserEntry() {
        this._data.existingUser.Release();
    }

    _OnLogoLoadSuccess(p_rsc) {
        this.media = p_rsc.objectURL;
    }

    _OnLogoLoadError(p_rsc) {
        this.media = nkm.style.URLImgs(`placeholder-dark.png`);
    }
}

module.exports = FriendCard;
ui.Register(`sgf-friendcard`, FriendCard);