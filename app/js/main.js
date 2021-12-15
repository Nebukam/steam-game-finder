'use strict';

//"builds": "D:/wamp/www/SGF"

const nkm = require(`@nkmjs/core`);
const ui = nkm.ui;
const com = nkm.common;
const app = nkm.app;

const sgfViews = require(`./views`);
const sgfExplorers = require(`./explorers`);

const AppOptionsExplorer = require(`./app-options/app-options-explorer`);
const Database = require(`./data/database`);

/**
 * SteamGameFinder allows you to find which multiplayer games are shared within a group of steam users
 */
class SteamGameFinder extends app.AppBase {

    constructor() { super(); }

    _Init() {
        super._Init();
/*
        this._defaultUserPreferences = {
            gamelist:{}
        };
*/
        // Setup Steam cookies

        this._fiftyYearsAgo = ((Date.now() - 1576800000000) / 1000).toFixed();
        document.cookie = `wants_mature_content="1"`;
        document.cookie = `birthtime=${this._fiftyYearsAgo}`;
        document.cookie = `path=/`;
        document.cookie = `max-age=315360000`;

        //axios.defaults.withCredentials = true;

        this._layers = [
            { id: `mainLayout`, cl: require("./main-layout") }
        ];


    }

    get database() { return this._DB; }

    AppReady() {
        super.AppReady();
        
        this._DB = new Database();

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

        /*
        this._gamesList = this.mainLayout.workspace.Host({
            [ui.IDS.VIEW_CLASS]: sgfViews.GamesList,
            [ui.IDS.NAME]: `Shared Games`,
            [ui.IDS.STATIC]: true
        });
        */

        /*
        this._friendsList = this.mainLayout.workspace.Host({
            [ui.IDS.VIEW_CLASS]: sgfViews.FriendsList,
            [ui.IDS.NAME]: `Friends`,
            [ui.IDS.STATIC]: true
        });
        */

        //this._gamesList.options.view.RequestDisplay();

        this._gamesList = this.mainLayout.Add(sgfViews.GamesList, `workspace`);
        new ui.manipulators.GridItem(this._gamesList, 2, 2, 1, 1);


        let cachedUserList = nkm.env.prefs.Get(`userlist`, null);
        if(cachedUserList){
            for(var i = 0; i < cachedUserList.length; i++){
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

    _RequestFriendList(p_user){
       
       // this._friendsList.options.view.LoadFriendlist(p_user);

        let opts = { 
            orientation: ui.FLAGS.HORIZONTAL, 
            placement: ui.FLAGS.LEFT,
            title: `Friendlist`,
            user:p_user,
            contentClass:sgfViews.FriendsList
        };

        nkm.actions.Emit(nkm.uilib.REQUEST.DRAWER, opts, this);
    
    }

    _429() {
        nkm.dialog.Push({
            [ui.IDS.TITLE]: `Ewwww.`,
            [ui.IDS.MESSAGE]: `It appears that Steam has temporarily locked out your IP from requesting data.</br><b>Wait a few minutes and come back.</b>`,
            actions: [
                { label: `Ok` }
            ],
            origin: this,
            [ui.IDS.ICON]: `warning`,
            [ui.IDS.FLAVOR]: nkm.common.FLAGS.WARNING,
            [ui.IDS.VARIANT]: ui.FLAGS.FRAME
        });
    }


}

module.exports = SteamGameFinder;