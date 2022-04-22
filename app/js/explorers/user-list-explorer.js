const nkm = require(`@nkmjs/core`);
const ui = nkm.ui;
const uilib = nkm.uilib;

const comps = require(`../components`);
const SIGNAL = require(`../signal`);

const RemoteDataBlock = require(`../data/remote-data-block`);

const base = nkm.uiworkspace.Explorer;
class UserListExplorer extends base {
    constructor() { super(); }

    _Init() {

        super._Init();

        this._usermap = new nkm.collections.Dictionary();

        let database = nkm.env.APP.database;

        database.Watch(SIGNAL.USER_ADDED, this._OnUserAdded, this);
        database.Watch(SIGNAL.USER_REMOVED, this._OnUserRemoved, this);
        database.Watch(SIGNAL.USER_UPDATED, this._OnUserUpdated, this);

        //nkm.env.features.Watch(nkm.env.SIGNAL.DISPLAY_TYPE_CHANGED, this._OnDisplayTypeChanged, this);

    }
/*
    _OnDisplayTypeChanged(p_newMode, p_oldMode) {
        if (p_newMode == nkm.env.ENV_DISPLAY.MOBILE) {
            this.style.setProperty(`--panelWidth`, `calc(100% - 25px)`);
        } else {
            delete this.style.removeProperty(`--panelWidth`);
        }
    }
*/
    static _Style() {
        return nkm.style.Extends({
            ':host': {
                'max-width': '325px',
            },
            '.header, .footer': {
                'padding': '10px'
            },
            '.body': {
                'padding': '0px 8px 0px 4px',
                'webkit-box-shadow':'none',
                'box-shadow':'none'
            },
            '.user-input-field': {

            },
            '.user-card': {
                'margin-bottom': '4px',
                'width': '100%'
            },
            '.info-card': {
                'flex': '1 1 auto',
                'margin': '4px',
                'margin-top':'0px',
                '--size': '100%-8px'
            },
            '.btn':{
                'margin':'4px'
            }


        }, base._Style());
    }

    _Render() {

        super._Render();

        this.Attach(comps.UserInputField, `user-input-field`, this._header);

        /*
        for(let i = 0; i < 13; i++){
            let card = this.Attach(comps.cards.UserCard, `user-card`);
            card.title = "Gamertag";
            card.subtitle = "Private profile";
            card.label = "{xxx} games in library";
        }
        */

        this._refreshAllBtn = this.Attach(uilib.buttons.Button, 'btn', this._footer);
        this._refreshAllBtn.options = {
            [ui.IDS.LABEL]: `Reload all profiles`,
            variant:ui.FLAGS.FRAME,
            trigger:{fn:this._Bind(this._ReloadAll)}
        }

        this._copyBtn = this.Attach(uilib.buttons.Button, 'btn', this._footer);
        this._copyBtn.options = {
            [ui.IDS.LABEL]: `Copy to clipboard`,
            trigger:{fn:this._Bind(this._CopyUsersToClipboard)}
        }

        

        this._infoCard = this.Attach(uilib.cards.Icon, 'info-card', this._body);
        uilib.cards.Icon.__distribute.Update(
            this._infoCard,
            {
                [`header-placement`]: ui.FLAGS.TOP,
                title: "Add friends !",
                subtitle:"<b>Just type their nickname and click [+] !</b></br></br>If that doesn't work, try with their unique profile ID; it's a 17-long number you can find when visiting your friend profile page on the Steam community website.</br>You can also paste the whole url.",
                label:"</br>Note that if you are loggued to the steam community website while using the Steam Game Finder, you should be able to load your friends profile even if private.",
                variant: ui.FLAGS.MINIMAL,
                flavor: ui.FLAGS.CTA,
                icon: `up`
            });

    }

    //#region user management

    _OnUserAdded(p_user) {
        var ctrl = this._usermap.Get(p_user);
        if (ctrl) { return; }
        ctrl = this.Attach(comps.cards.UserCard, `user-card`);
        ctrl.data = p_user;
        ctrl._friendsCallback = this._friendsCallback;
        this._usermap.Set(p_user, ctrl);

        this._infoCard.visible = false;
    }

    _OnUserRemoved(p_user) {
        var ctrl = this._usermap.Get(p_user);
        if (!ctrl) { return; }
        this._usermap.Remove(p_user);
        ctrl.Release();

        if (this._usermap.count == 0) {
            this._infoCard.visible = true;
        } else {
            this._infoCard.visible = false;
        }

    }

    _OnUserUpdated(p_user) {

    }

    //#endregion

    _CopyUsersToClipboard(){
        navigator.clipboard.writeText(JSON.stringify(nkm.env.APP.database._GetUserJSONData()));
    }

    _ReloadAll(){
        let users = this._usermap.keys;
        for(var i = 0; i < users.length; i++){
            users[i].RequestRefresh();
        }
    }

}

module.exports = UserListExplorer;
ui.Register(`sgf-userlist`, UserListExplorer);