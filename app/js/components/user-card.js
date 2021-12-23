const nkm = require(`@nkmjs/core`);
const ui = nkm.ui;
const uilib = nkm.uilib;

const RemoteDataBlock = require(`../data/remote-data-block`);

const _flag_noProfile = 'no-profile';

class UserCard extends uilib.cards.Media {
    constructor() { super(); }

    static __default_headerPlacement = ui.FLAGS.LEFT;
    static __usePaintCallback = true;

    _Init() {
        super._Init();

        this._Bind(this._OnToggleUserActivation);
        this._Bind(this._OnMediaLoadSuccess);
        this._Bind(this._OnMediaLoadError);

        this._flags.Add(this, _flag_noProfile);
        this._flags.Add(this, `inactive`);

        this._mediaLoaded = false;
        this._delayedInfosUpdate = new nkm.com.time.DelayedCall(this._Bind(this._UpdateInfos));

    }

    _OnPaintChange() {
        super._OnPaintChange();
        this._UpdateMedia();

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
                'opacity': `var(--op)`,
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
        this._deleteBtn = this.Add(uilib.buttons.Tool, `btn-delete`);
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

    _OnDataChanged(p_oldData) {
        this._mediaLoaded = false;
        this.media = nkm.style.URLImgs(`placeholder-dark.png`);
        super._OnDataChanged(p_oldData);
    }

    _OnDataUpdated(p_data) {

        super._OnDataUpdated(p_data);
        this._delayedInfosUpdate.Schedule();
    }

    _UpdateInfos() {

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
                    subtitle = `${data.gamesCount} products in library`;
                }

                break;
            case RemoteDataBlock.STATE_INVALID:
                console.log(data);
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

        this._UpdateMedia();

    }

    _UpdateMedia() {

        if (this._mediaLoaded) { return; }
        if (!this._isPainted || !this._data) { return; }
        if (this._data.state != RemoteDataBlock.STATE_READY) {
            if (this._data.state == RemoteDataBlock.STATE_INVALID) {
                if (this._data._avatarURL == ``) { return; }
            } else {
                return;
            }
        }

        this._mediaLoaded = true;

        "#if WEB";
        if (!nkm.env.isExtension && !nkm.env.isNodeEnabled) {
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

    _Cleanup() {
        this.media = nkm.style.URLImgs(`placeholder-dark.png`);
        this._mediaLoaded = false;
        super._Cleanup();
    }

}

module.exports = UserCard;
ui.Register(`sgf-usercard`, UserCard);