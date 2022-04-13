const nkm = require(`@nkmjs/core`);
const ui = nkm.ui;
const uilib = nkm.uilib;

const RemoteDataBlock = require(`../../data/remote-data-block`);
const MediaCardEx = require(`./media-card-ex`);

const _flag_noProfile = 'no-profile';

class FriendCard extends MediaCardEx {
    constructor() { super(); }

    static __defaultHeaderPlacement = ui.FLAGS.LEFT;

    _Init() {
        super._Init();
        this._mediaPropertyName = `_avatarURL`;
        this._Bind(this._OnToggleUserActivation);
        this._flags.Add(this, _flag_noProfile);
    }

    _Style() {
        return nkm.style.Extends({
            ':host': {
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
        }, super._Style());
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

    _UpdateInfos() {

        if(!super._UpdateInfos()){ return false; }

        this.title = this._data._personaID;
        this.subtitle = null;
        this.label = null;

        if (this._data.existingUser) {
            this.flavor = ui.FLAGS.CTA;
            this._deleteBtn.visible = true;
        } else {
            this.flavor = null;
            this._deleteBtn.visible = false;
        }
        return true;

    }

    _ShouldLoadMedia(p_data){ return true; }

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

module.exports = FriendCard;
ui.Register(`sgf-friendcard`, FriendCard);