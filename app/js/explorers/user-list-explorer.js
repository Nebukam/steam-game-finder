const nkm = require(`@nkmjs/core`);
const ui = nkm.ui;
const uilib = nkm.uilib;

const comps = require(`../components`);
const SIGNAL = require(`../data/signal`);

const RemoteDataBlock = require(`../data/remote-data-block`);

class UserListExplorer extends nkm.uiworkspace.Explorer {
    constructor() { super(); }

    _Init() {

        super._Init();

        this._usermap = new nkm.collections.Dictionary();

        nkm.env.APP.database.Watch(SIGNAL.USER_ADDED, this._OnUserAdded, this);
        nkm.env.APP.database.Watch(SIGNAL.USER_REMOVED, this._OnUserRemoved, this);
        nkm.env.APP.database.Watch(SIGNAL.USER_UPDATED, this._OnUserUpdated, this);
        nkm.env.APP.database.Watch(SIGNAL.INFOS_UPDATED, this._OnInfosUpdated, this);

        nkm.env.features.Watch(nkm.env.SIGNAL.DISPLAY_TYPE_CHANGED, this._OnDisplayTypeChanged, this);

    }

    _OnDisplayTypeChanged(p_newMode, p_oldMode) {
        if (p_newMode == nkm.env.ENV_DISPLAY.MOBILE) {
            this.style.setProperty(`--panelWidth`, `100%-50px`);
        } else {
            delete this.style.removeProperty(`--panelWidth`);
        }
    }

    _Style() {
        return nkm.style.Extends({
            ':host': {
                '--panelWidth': '325px',
                'width': 'var(--panelWidth)'
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


        }, super._Style());
    }

    _Render() {

        super._Render();

        this.Add(comps.UserInputField, `user-input-field`, this._header);

        /*
        for(let i = 0; i < 13; i++){
            let card = this.Add(comps.UserCard, `user-card`);
            card.title = "Gamertag";
            card.subtitle = "Private profile";
            card.label = "{xxx} games in library";
        }
        */

        this._refreshAllBtn = this.Add(uilib.buttons.Button, 'btn', this._footer);
        this._refreshAllBtn.options = {
            [ui.IDS.LABEL]: `Reload all profiles`,
            variant:ui.FLAGS.FRAME,
            trigger:{fn:this._Bind(this._ReloadAll)}
        }

        this._copyBtn = this.Add(uilib.buttons.Button, 'btn', this._footer);
        this._copyBtn.options = {
            [ui.IDS.LABEL]: `Copy to clipboard`,
            trigger:{fn:this._Bind(this._CopyUsersToClipboard)}
        }

        

        this._infoCard = this.Add(uilib.cards.Icon, 'info-card', this._body);
        this._infoCard._optionsHandler.Process(
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
        ctrl = this.Add(comps.UserCard, `user-card`);
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
        this._OnInfosUpdated();
    }

    //#endregion

    //#region infos
    _OnInfosUpdated() {

        var statusText = `Add some users to start !`;
        var substatus = ``;
        //this._submitBtn.visible = false;

        switch (nkm.env.APP.database._userStatuses) {

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
                if (m > 0) { statusText = `${m} games matches filters`; }
                else { statusText = `0 games matches filters`; }

                //this._submitBtn.visible = (l != 0);
                break;
            case RemoteDataBlock.STATE_INVALID:
                statusText = `Something went wrong`;
                break;

        }

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