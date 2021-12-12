'use strict';

const nkm = require(`@nkmjs/core`);
const ui = nkm.ui;
const com = nkm.common;
const app = nkm.app;

const LocalisationExplorer = require(`./localisation/explorer`);
const OverviewExplorer = require(`./overview/explorer`);
const AppOptionsExplorer = require(`./app-options/explorer`);
const WorkspacePlaceholder = require(`./wks-placeholder`);
const WelcomeView = require(`./welcome-view`);

/**
 * NKMToolbox is a little tool designed to facilitate the creation & localisation
 * of apps that are built with the NKMjs Framework.
 */
class NKMToolbox extends app.AppBase {

    constructor() { super(); }

    _Init() {
        super._Init();

        nkm.uiworkspace.Workspace.__default_placeholderViewClass = WorkspacePlaceholder;

        this._layers = [
            { id: `mainLayout`, cl: require("./main-layout") }
        ];
    }

    AppReady() {
        super.AppReady();

        this._mainCatalog = nkm.data.catalogs.CreateFrom({
            [com.IDS.NAME]: `NKMjs Toolbox`
        }, [
            {
                [com.IDS.NAME]: `Overview`,
                [com.IDS.ICON]: `new`,
                [ui.IDS.VIEW_CLASS]: OverviewExplorer
            },
            {
                [com.IDS.NAME]: `Localization`,
                [com.IDS.ICON]: `icon`,
                [ui.IDS.VIEW_CLASS]: LocalisationExplorer
            }
        ]);


        let mainShelf = this.mainLayout.shelf;
        mainShelf.catalog = this._mainCatalog;
        mainShelf.RequestPlaceholderView();

        mainShelf.nav.toolbar.CreateHandle({
            [com.IDS.NAME]: `Overview`,
            [com.IDS.ICON]: `icon`,
            [ui.IDS.TRIGGER]: {
                fn: mainShelf.SetCurrentView,
                thisArg: mainShelf,
                arg: ui.UI.Rent(AppOptionsExplorer)
            }
        });

        this.mainLayout.workspace.Host({
            [ui.IDS.VIEW_CLASS]: WelcomeView,
            [ui.IDS.NAME]: `Welcome !`
        });


    }


}

module.exports = NKMToolbox;