const nkm = require(`@nkmjs/core`);
const ui = nkm.ui;
const uilib = nkm.uilib;

const RemoteDataBlock = require(`../../data/remote-data-block`);
const MediaCardEx = require(`./media-card-ex`);

const _flag_noProfile = 'no-profile';

class UserCard extends MediaCardEx {
    constructor() { super(); }

    static __defaultHeaderPlacement = ui.FLAGS.LEFT;

    _Init() {
        super._Init();

        this._mediaPropertyName = `_avatarURL`;

        this._Bind(this._OnToggleUserActivation);

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
                '--currentOpacity': 1,
                '--op': 0,
                'opacity': `var(--op) !important`,
                'transition': 'opacity 0.5s',
                'height': '115px',
                //margin:'10px'
                '--header-size': '115px'
            },
            ':host(.inactive)': {
                '--currentOpacity': '0.5'
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
        this._deleteBtn = this.Attach(uilib.buttons.Tool, `btn-delete`);
        this._deleteBtn.options = {
            htitle: `Delete`, icon: 'close-small',
            trigger: { fn: this._Bind(this._DeleteUserEntry) },
            variant: ui.FLAGS.MINIMAL
        }

        this.actions = [
            {
                htitle: `Refresh game list`, icon: 'refresh',
                trigger: { fn: this._Bind(this._RefreshCache) },
                member: { owner: this, id: '_btnRefresh' },
                variant: ui.FLAGS.MINIMAL
            },
            {
                htitle: `Browser friendlist`, label: 'Friendlist',
                trigger: { fn: this._Bind(this._OpenFriendlist) },
                member: { owner: this, id: '_btnFriendlist' },
                variant: ui.FLAGS.FRAME
            },
            {
                cl: uilib.inputs.Boolean,
                inputWatchers: [{ signal: ui.inputs.SIGNAL.VALUE_SUBMITTED, fn: this._OnToggleUserActivation }],
                member: { owner: this, id: '_btnToggle' },
                currentValue: true
            },
            {
                label: `Try a search`, icon: 'search',
                trigger: { fn: this._Bind(this._OpenSearch) },
                member: { owner: this, id: '_btnSearch' },
                variant: ui.FLAGS.MINIMAL
            }
        ];

        this._toolbar.size = ui.FLAGS.SIZE_XS;

    }

    _UpdateInfos() {

        if(!super._UpdateInfos()){ return false; }

        let data = this._data;

        if (this._btnToggle)
            this._btnToggle.currentValue = data.active;

        this._flags.Set(`inactive`, !data.active);

        //        this.media = (p_data._avatarURL || nkm.style.URLImgs(`placeholder-dark.png`));
        this.title = data._personaID;


        let subtitle = `...`;
        let noProfile = false;
        let variant = null;
        let flavor = null;
        let showToolbar = true;

        //let label = p_data._privacy;

        switch (data.state) {
            case RemoteDataBlock.STATE_NONE:
            case RemoteDataBlock.STATE_LOADING:
                subtitle = `loading...`;
                flavor = nkm.com.FLAGS.LOADING;
                showToolbar = false;
                break;
            case RemoteDataBlock.STATE_READY:
                if (data._privacy == `private`) {
                    subtitle = `Library is private`;
                    flavor = nkm.com.FLAGS.WARNING;
                    //variant = ui.FLAGS.MINIMAL;
                } else {
                    subtitle = `${data.gamesCount} products`;
                }

                break;
            case RemoteDataBlock.STATE_INVALID:
                //console.log(data);
                if (data._privacy == `friendsonly`) {
                    subtitle = `Only visible to his friends.`;
                    flavor = nkm.com.FLAGS.ERROR;
                    this.label = `Sign-in to <a href="https://steamcommunity.com/">steamcommunity.com</a>`
                }
                else if (data._privacy == `private`) {
                    subtitle = `Profile is private.`;
                    flavor = nkm.com.FLAGS.ERROR;
                    //variant = ui.FLAGS.MINIMAL;
                } else {
                    subtitle = `Could not be loaded.`;
                    flavor = nkm.com.FLAGS.ERROR;
                    showToolbar = false;
                    noProfile = true;
                }

                break;
        }

        //this._toolbar.visible = showToolbar;
        this.flavor = flavor;
        this.variant = variant;
        this._flags.Set(_flag_noProfile, noProfile);

        this._btnRefresh.visible = data._isUsingCache;
        this._btnToggle.visible = data.state == RemoteDataBlock.STATE_READY;
        this._btnFriendlist.visible = data.state == RemoteDataBlock.STATE_READY;
        this._btnSearch.visible = noProfile;

        this.subtitle = subtitle;

        return true;

    }

    _ShouldLoadMedia(p_data){
        if (this._data.state != RemoteDataBlock.STATE_READY) {
            if (this._data.state == RemoteDataBlock.STATE_INVALID) {
                if (this._data._avatarURL == ``) { return false; }
            } else {
                return false;
            }
        }
        return true;
    }
    
    _OnToggleUserActivation(p_input, p_value) {
        this._data.active = p_value;
    }

    _OpenFriendlist() {
        nkm.env.APP._RequestFriendList(this._data);
    }

    _OpenSearch() {
        nkm.env.APP._RequestSearchList(this._data);
    }

    _RefreshCache() {
        this._data.RequestRefresh();
    }

    _DeleteUserEntry() {
        nkm.env.prefs.Delete(`users._${this._data.userid}.gamelist`);
        this._data.Release();
    }

}

module.exports = UserCard;
ui.Register(`sgf-usercard`, UserCard);