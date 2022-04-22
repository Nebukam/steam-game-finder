const nkm = require(`@nkmjs/core`);
const ui = nkm.ui;
const uilib = nkm.uilib;

const _flag_noProfile = 'no-profile';

const base = uilib.cards.Media;

class SearchCard extends base {
    constructor() { super(); }

    static __defaultHeaderPlacement = ui.FLAGS.LEFT;

    _Init() {
        super._Init();

        this._Bind(this._OnToggleUserActivation);
        this._Bind(this._OnMediaLoadSuccess);
        this._Bind(this._OnMediaLoadError);

        this._mediaLoaded = false;

        this._flags.Add(this, _flag_noProfile);
    }

    static _Style() {
        return nkm.style.Extends({
            ':host': {
                'cursor':'pointer',
                'transition': 'opacity 0.5s',
                'height': '55px',
                //margin:'10px'
                '--header-size': '55px'
            },
            '.header': {
                'width': 'var(--header-size)',
                'min-height': 'var(--header-size)',
                'min-width': 'var(--header-size)',
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
                'opacity': 0.5
            },
            '.btn-delete': {
                'position': 'absolute',
                'top': '18px',
                'right': '18px',
                '--size': 'var(--size-xs)'
            }
        }, base._Style());
    }

    _Render() {
        super._Render();
        this._frame[ui.IDS.TITLE].ellipsis = true;
        this._deleteBtn = this.Attach(uilib.buttons.Tool, `btn-delete`);
        this._deleteBtn.options = {
            htitle: `Delete`, icon: 'close-small',
            trigger: { fn: this._Bind(this._DeleteUserEntry) },
            variant: ui.FLAGS.MINIMAL
        }

        this.subtitle = `hahah`;
    }

    _OnDataChanged(p_oldData) {
        this._mediaLoaded = false;
        this.media = nkm.style.URLImgs(`placeholder-dark.png`); 
        super._OnDataChanged(p_oldData);
    }

    _OnDataUpdated(p_data) {

        super._OnDataUpdated(p_data);
        this.title = p_data._personaID;
        this.subtitle = null;
        this.label = null;

        if (p_data.existingUser) {
            this.flavor = ui.FLAGS.CTA;
            this._deleteBtn.visible = true;
        } else {
            this.flavor = null;
            this._deleteBtn.visible = false;
        }

        this._UpdateMedia();

    }

    _UpdateMedia() {

        if (this._mediaLoaded) { return; } 
        if (!this._data) { return; }

        this._mediaLoaded = true;

        "#if WEB";
        if (!nkm.env.isExtension || !nkm.env.isNodeEnabled) {
            this.media = (this._data._avatarURL || nkm.style.URLImgs(`placeholder-dark.png`));
        }
        "#endif";

        "#if EXT";
        nkm.io.Read(this._data._avatarURL,
            { cl: nkm.io.resources.BlobResource },
            {
                success: this._OnMediaLoadSuccess,
                error: this._OnMediaLoadError,
                parallel: true
            });
        "#endif";
    }

    _OnMediaLoadSuccess(p_rsc) {
        this.media = p_rsc.objectURL;
    }

    _OnMediaLoadError(p_rsc) {
        this.media = nkm.style.URLImgs(`placeholder-dark.png`);
    }

    _OnToggleUserActivation(p_input, p_value) {
        this._data.active = p_value;
    }

    Activate(p_evt) {
        if (!super.Activate(p_evt) || this._data.existingUser || this._deleteBtn._pointer.isMouseOver) { return false; }
        this._data.existingUser = nkm.env.APP.database.GetUser(this._data._profileID64);
        return true;
    }

    _DeleteUserEntry() {
        this._data.existingUser.Release();
    }

}

module.exports = SearchCard;
ui.Register(`sgf-searchcard`, SearchCard);