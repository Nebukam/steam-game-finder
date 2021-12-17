const nkm = require(`@nkmjs/core`);
const ui = nkm.ui;
const uilib = nkm.uilib;

const RemoteDataBlock = require("../data/remote-data-block");

const _flag_noProfile = 'no-profile';

class UserCard extends uilib.cards.Media {
    constructor() { super(); }

    static __default_headerPlacement = ui.FLAGS.LEFT;
    static __usePaintCallback = true;

    _Init() {
        super._Init();

        this._Bind(this._OnToggleUserActivation);
        this._Bind(this._OnLogoLoadSuccess);
        this._Bind(this._OnLogoLoadError);

        this._flags.Add(this, _flag_noProfile);
        this._flags.Add(this, `inactive`);
    }

    _OnPaintChange() {
        super._OnPaintChange();

        if (this._isPainted) {
            this.style.setProperty(`--op`, `var(--currentOpacity)`);
        } else {
            this.style.setProperty(`--op`, 0);
        }
    }

    _Style() {
        return nkm.style.Extends({
            ':host': {
                '--currentOpacity':1,
                '--op':0,
                'opacity': `var(--op)`,
                'transition': 'opacity 0.5s',
                'height': '115px',
                //margin:'10px'
                '--header-size': '115px'
            },
            ':host(.inactive)':{
                '--currentOpacity':'0.5'
            },
            '.header': {
                'min-height': '80px',
            },
            '.body .title': {
                'padding-right': '12px'
            },
            ':host(.no-profile)': {
                //'height':'80px',
                //margin:'10px'
            },
            ':host(.no-profile) .header': {
                //'height':'80px',
                '--currentOpacity': '0.3'
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

        this.actions = [
            {
                htitle: `Browser friendlist`, label: 'Friendlist',
                trigger: { fn: this._Bind(this._OpenFriendlist) },
                variant: ui.FLAGS.FRAME
            },
            {
                htitle: `Refresh game list`, icon: 'refresh',
                trigger: { fn: this._Bind(this._RefreshCache) },
                member: { owner: this, id: '_refreshCache' },
                variant: ui.FLAGS.MINIMAL
            },
            {
                cl: uilib.inputs.Boolean,
                inputWatchers: [{ signal: ui.inputs.SIGNAL.VALUE_SUBMITTED, fn: this._OnToggleUserActivation }],
                member: { owner: this, id: '_toggle' },
                currentValue: true
            }
        ];

        this._toolbar.size = ui.FLAGS.SIZE_XS;

    }

    _OnDataChanged(p_oldData) {
        super._OnDataChanged(p_oldData);
        if (this._data) {
            nkm.io.Read(this._data._avatarURL,
                { cl: nkm.io.resources.BlobResource },
                {
                    success: this._OnLogoLoadSuccess,
                    error: this._OnLogoLoadError,
                    parallel: true
                });
        }
    }

    _OnDataUpdated(p_data) {

        super._OnDataUpdated(p_data);

        if (this._toggle)
            this._toggle.currentValue = p_data.active;

        this._flags.Set(`inactive`, !p_data.active);

        this.media = (p_data._avatarURL || nkm.style.URLImgs(`placeholder-dark.png`));
        this.title = p_data._personaID;


        let subtitle = `...`;
        let noProfile = false;
        let variant = null;
        let flavor = null;
        let showToolbar = true;

        //let label = p_data._privacy;

        switch (this._data.state) {
            case RemoteDataBlock.STATE_NONE:
                flavor = nkm.com.FLAGS.WARNING;
                showToolbar = false;
                break;
            case RemoteDataBlock.STATE_LOADING:
                subtitle = `loading...`;
                flavor = nkm.com.FLAGS.LOADING;
                showToolbar = false;
                break;
            case RemoteDataBlock.STATE_READY:
                if (p_data._privacy == `private`) {
                    subtitle = `Profile is private`;
                    flavor = nkm.com.FLAGS.WARNING;
                    //variant = ui.FLAGS.MINIMAL;
                } else {
                    subtitle = `${p_data.gamesCount} products in library`;
                }

                break;
            case RemoteDataBlock.STATE_INVALID:
                if (p_data._privacy == `private`) {
                    subtitle = `Profile is private`;
                    flavor = nkm.com.FLAGS.WARNING;
                    //variant = ui.FLAGS.MINIMAL;
                } else {
                    subtitle = `Profile could not be loaded.`;
                    flavor = nkm.com.FLAGS.ERROR;
                    showToolbar = false;
                    noProfile = true;
                }
                break;
        }

        this._toolbar.visible = showToolbar;
        this.flavor = flavor;
        this.variant = variant;
        this._flags.Set(_flag_noProfile, noProfile);

        this._refreshCache.visible = p_data._isUsingCache;

        this.subtitle = subtitle;
        //this.label = label;

    }

    _OnToggleUserActivation(p_input, p_value) {
        this._data.active = p_value;
    }

    _OpenFriendlist() {
        nkm.env.APP._RequestFriendList(this._data);
    }

    _RefreshCache(){
        this._data.RequestRefresh();
    }

    _DeleteUserEntry() {
        nkm.env.prefs.Delete(`users._${this._data.userid}.gamelist`);
        this._data.Release();
    }


    _OnLogoLoadSuccess(p_rsc) {
        this.media = p_rsc.objectURL;
    }

    _OnLogoLoadError(p_rsc) {
        this.media = nkm.style.URLImgs(`placeholder-dark.png`);
    }

}

module.exports = UserCard;
ui.Register(`sgf-usercard`, UserCard);