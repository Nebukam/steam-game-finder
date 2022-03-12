
//"builds": "D:/wamp/www/SGF"

const nkm = require(`@nkmjs/core`);
const com = nkm.com;
const ui = nkm.ui;

const sgfViews = require(`./views`);
const sgfExplorers = require(`./explorers`);

const AppOptionsExplorer = require(`./app-options/app-options-explorer`);
const Database = require(`./data/database`);
const FilterManager = require(`./filtering/filter-manager`);

/**
 * SteamGameFinder allows you to find which multiplayer games are shared within a group of steam users
 */
class SteamGameFinder extends nkm.app.AppBase {

    constructor() { super(); }

    _Init() {
        super._Init();

        this._ping = new nkm.io.helpers.Ping(`https://steam-game-finder-server.glitch.me/user/profile/Nebukam`);
        this._locationRequest = null;
        this._IPInfos = null;

        // Setup Steam cookies
/*
        this._fiftyYearsAgo = ((Date.now() - 1576800000000) / 1000).toFixed();
        document.cookie = `lastagecheckage=1-0-1919`;
        document.cookie = `wants_mature_content="1"`;
        document.cookie = `birthtime=${this._fiftyYearsAgo}`;
        document.cookie = `path=/`;
        document.cookie = `max-age=315360000`;
*/

        ui.dom.SetCookie(`wants_mature_content`, `"1"`);
        ui.dom.SetCookie(`birthtime`, ((Date.now() - 1576800000000) / 1000).toFixed());
        ui.dom.SetCookie(`max-age`, 315360000);

        //axios.defaults.withCredentials = true;

        this._layers = [
            { id: `mainLayout`, cl: require(`./main-layout`) }
        ];


    }

    get database() { return this._DB; }
    get filters() { return this._filters; }

    AppReady() {

        super.AppReady();

        this._DB = new Database();
        this._filters = new FilterManager();

        this._mainCatalog = nkm.data.catalogs.CreateFrom({
            [com.IDS.NAME]: `SGF`
        }, [
            {
                [com.IDS.NAME]: `Friends`,
                [com.IDS.ICON]: `view-list`,
                [ui.IDS.VIEW_CLASS]: sgfExplorers.UserList
            },
            {
                [com.IDS.NAME]: `Filters`,
                [com.IDS.ICON]: `search`,
                [ui.IDS.VIEW_CLASS]: sgfExplorers.GameFilters
            },
            {
                [com.IDS.NAME]: `Infos`,
                [com.IDS.ICON]: `infos`,
                [ui.IDS.VIEW_CLASS]: sgfExplorers.Infos
            }
        ]);


        let mainShelf = this.mainLayout.shelf;
        mainShelf.catalog = this._mainCatalog;
        mainShelf.RequestView(0);

        /*
        mainShelf.nav.toolbar.CreateHandle({
            [com.IDS.NAME]: `Options`,
            [com.IDS.ICON]: `icon`,
            [ui.IDS.TRIGGER]: {
                fn: mainShelf.SetCurrentView,
                thisArg: mainShelf,
                arg: ui.UI.Rent(AppOptionsExplorer)
            }
        });
        */


        this._gamesList = this.mainLayout.workspace.Host({
            [ui.IDS.VIEW_CLASS]: sgfViews.GamesList,
            [ui.IDS.NAME]: `Shared Games`,
            [ui.IDS.ICON]: `visible`,
            [ui.IDS.STATIC]: true
        });

        this._gamesGroup = this.mainLayout.workspace.Host({
            [ui.IDS.VIEW_CLASS]: sgfViews.GamesGroups,
            [ui.IDS.NAME]: `Grouped by Owners`,
            [ui.IDS.ICON]: `dots`,
            [ui.IDS.STATIC]: true
        });

        this._gamesList.options.view.RequestDisplay();
        //this._gamesGroup.options.view.RequestDisplay();
        //this._gamesList = this.mainLayout.Add(sgfViews.GamesList, `workspace`);
        //new ui.manipulators.GridItem(this._gamesList, 2, 2, 1, 1);


        let cachedUserList = nkm.env.prefs.Get(`userlist`, null);
        if (cachedUserList) {
            for (var i = 0; i < cachedUserList.length; i++) {
                let data = cachedUserList[i];
                let user = this._DB.GetUser(data.id);
                user.active = data.active;
            }
        }

        //Load some users

        //this._DB.GetUser(`76561197998180826`);
        //this._DB.GetUser(`asdasdasdasd as das dasdasdasdasdasdasdasdasdasdasdasdasdasd`);
        //this._DB.GetUser(`76561198055276814`); //gloomy mary 1500+games
        //this._DB.GetUser(`nebukam`);
        //this._DB.GetUser(`asd`); // should be private

        //this._429();

    }

    _RequestFriendList(p_user) {

        // this._friendsList.options.view.LoadFriendlist(p_user);

        let opts = {
            orientation: ui.FLAGS.HORIZONTAL,
            placement: ui.FLAGS.LEFT,
            title: `Friendlist`,
            user: p_user,
            contentClass: sgfViews.FriendsList
        };

        nkm.actions.Emit(nkm.uilib.REQUEST.DRAWER, opts, this);

    }

    _RequestSearchList(p_user) {

        // this._friendsList.options.view.LoadFriendlist(p_user);

        let opts = {
            orientation: ui.FLAGS.HORIZONTAL,
            placement: ui.FLAGS.LEFT,
            title: `User search`,
            user: p_user,
            contentClass: sgfViews.SearchResult
        };

        nkm.actions.Emit(nkm.uilib.REQUEST.DRAWER, opts, this);

    }

    _RequestGameInfos(p_app) {

        // this._friendsList.options.view.LoadFriendlist(p_user);

        let opts = {
            orientation: ui.FLAGS.HORIZONTAL,
            placement: ui.FLAGS.RIGHT,
            title: `${p_app.name}`,
            app: p_app,
            contentClass: sgfViews.GameInfos
        };

        nkm.actions.Emit(nkm.uilib.REQUEST.DRAWER, opts, this);

    }

    _429() {

        nkm.dialog.Push({
            [ui.IDS.TITLE]: `Dang.`,
            [ui.IDS.MESSAGE]: `Too many requests at the moment; server can't handle it.</br><b>Wait a few minutes and come back.</b>`,
            actions: [
                { label: `Ok` }
            ],
            origin: this,
            [ui.IDS.ICON]: `warning`,
            [ui.IDS.FLAVOR]: com.FLAGS.WARNING,
            [ui.IDS.VARIANT]: ui.FLAGS.FRAME
        });

    }

    _GetURLProfile(p_id) {
        let url;
        "#if WEB";
        url = `https://steam-game-finder-server.glitch.me/user/profile/${p_id}`
        "#elif EXT";
        url = `https://steamcommunity.com/id/${p_id}?xml=1`;
        "#endif";
        return url;
    }

    _GetURLProfile64(p_id) {
        let url;
        "#if WEB";
        url = `https://steam-game-finder-server.glitch.me/user/profile64/${p_id}`
        "#elif EXT";
        url = `https://steamcommunity.com/profiles/${p_id}?xml=1`;
        "#endif";
        return url;
    }

    _GetURLLibrary(p_id) {
        let url;
        "#if WEB";
        url = `https://steam-game-finder-server.glitch.me/user/library/${p_id}`;
        "#elif EXT";
        url = `https://steamcommunity.com/profiles/${p_id}/games/?tab=all`;
        "#endif";
        return url;
    }


    _GetURLFriendlist(p_id) {
        let url;
        "#if WEB";
        url = `https://steam-game-finder-server.glitch.me/user/friendlist/${p_id}`;
        "#elif EXT";
        url = `https://steamcommunity.com/profiles/${p_id}/friends`;
        "#endif";
        return url;
    }

    _GetURLSearch(p_id) {
        let url;
        "#if WEB";
        url = `https://steam-game-finder-server.glitch.me/user/search/${p_id}`;
        "#elif EXT";
        url = `https://steamcommunity.com/search/users/#text=${p_id}`;
        "#endif";
        return url;
    }

    _GetURLStore(p_id) {
        let url;
        "#if WEB";
        url = `https://steam-game-finder-server.glitch.me/store/${p_id}`;
        "#elif EXT";
        url = `https://store.steampowered.com/app/${p_id}/`;
        "#endif";
        return url;
    }

    //#region server ping

    _IsReadyForDisplay() {

        if(!this._CheckIP()){ 
            return false;
        }

        if (!nkm.env.isExtension && !nkm.env.isNodeEnabled) {

            if (this._ping.Ping()) {

                if (!this._ping.success) {
                    nkm.dialog.Push({
                        [ui.IDS.TITLE]: `Server not responding`,
                        [ui.IDS.MESSAGE]:
                            `The Glitch server is not responding, `
                            + `it is highly likely that it has exceeded its quotas for this month : not much can be done about it.<br><br>`
                            + `You can still use the <a href="https://github.com/Nebukam/steam-game-finder">browser extensions</a>, they don't need the server ;)`,
                        origin: this,
                        [ui.IDS.ICON]: `warning`,
                        [ui.IDS.FLAVOR]: com.FLAGS.WARNING,
                        //[ui.IDS.VARIANT]: ui.FLAGS.FRAME
                    });
                } else {
                    if (!nkm.env.prefs.Get(`popups.hide-disclaimer-v1`, false)) {
                        nkm.dialog.Push({
                            [ui.IDS.TITLE]: `Howdy!`,
                            [ui.IDS.MESSAGE]:
                                `The Steam Game Finder web app has one major limitation : it cannot see private profiles.`
                                + `<br><br>Use the <a href="https://github.com/Nebukam/steam-game-finder">browser extensions</a> for the full experience.`,
                            actions: [
                                { label: `Ok, don't remind me.`, trigger:{ fn:() => { nkm.env.prefs.Set(`popups.hide-disclaimer-v1`, true)} } },
                                { label: `Ok`, flavor: nkm.com.FLAGS.INFOS } //, variant:ui.FLAGS.FRAME
                            ],
                            origin: this,
                            [ui.IDS.ICON]: `infos`,
                            [ui.IDS.FLAVOR]: com.FLAGS.INFOS,
                            //[ui.IDS.VARIANT]: ui.FLAGS.FRAME
                        });
                    }
                }

                return true;

            }

            return false;

        } else {

            if (!nkm.env.prefs.Get(`popups.hide-note-v1`, false)) {
                nkm.dialog.Push({
                    [ui.IDS.TITLE]: `Note on private profiles`,
                    [ui.IDS.MESSAGE]:
                        `In order to view private friend profiles, you need to be signed-in to <a href="https://steamcommunity.com/">steamcommunity.com</a>. `
                        + `Please note that some profiles may remain private anyway.`,
                    actions: [
                        { label: `Ok, don't remind me.`, trigger:{ fn:() => { nkm.env.prefs.Set(`popups.hide-note-v1`, true) }} },
                        { label: `Ok`, flavor: nkm.com.FLAGS.INFOS } //, variant:ui.FLAGS.FRAME
                    ],
                    origin: this,
                    [ui.IDS.ICON]: `infos`,
                    [ui.IDS.FLAVOR]: com.FLAGS.INFOS,
                    //[ui.IDS.VARIANT]: ui.FLAGS.FRAME
                });
            }
        }

        return true;

    }

    _CheckIP(){
        if(this._checkinIP){ 
            if(this._IPChecked){ return true; }
            return false; 
        }
        this._checkinIP = true;
        this._IPChecked = false;

        nkm.io.Read(
            `https://ipinfo.io/json`,
            { cl: nkm.io.resources.JSONResource },
            {
                success: this._Bind(this._OnIPRequestSuccess),
                error: this._Bind(this._OnIPRequestEnd),
                any:this._Bind(this._OnIPRequestEnd),
                withCredentials:false
            }
        );
        
    }

    _OnIPRequestSuccess(p_rsc){
        this._IPChecked = true;
        this._IPInfos = p_rsc.content;
    }

    _OnIPRequestEnd(){
        this._IPChecked = true;
        console.log(`Store location : `, this._IPInfos);
    }
    

    //#endregion


}

module.exports = SteamGameFinder;