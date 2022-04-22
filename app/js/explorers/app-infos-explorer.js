const nkm = require(`@nkmjs/core`);
const ui = nkm.ui;
const uilib = nkm.uilib;

const comps = require(`../components`);
const SIGNAL = require(`../signal`);

const RemoteDataBlock = require(`../data/remote-data-block`);

const base = nkm.uiworkspace.Explorer;
class AppInfosExplorer extends base {
    constructor() { super(); }

    _Init() {
        super._Init();
    }

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
                'webkit-box-shadow': 'none',
                'box-shadow': 'none'
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
                'margin-top': '0px',
                '--size': '100%-8px'
            },
            '.item':{
                'flex':'1 1 auto',
                'margin-bottom':'10px',
                'padding':'10px'
            },
            '.title': {
                'margin': '10px',
                'margin-top': '0px',
                'padding-top': '20px',
                'padding-left': '0',
                'font-weight': '900',
                'flex': '1 1 66%',
                'border-top': '2px solid rgba(140,140,140,0.15)'
            }


        }, base._Style());
    }

    _Render() {

        super._Render();

        this._infoCard = this.Attach(uilib.cards.Icon, 'info-card', this._body);
        this._infoCard._mediaPlacement.Set(ui.FLAGS.TOP);

        this._infoCard.icon = `infos`;
        this._infoCard.flavor = nkm.com.FLAGS.INFOS;
        this._infoCard.title = `Steam : Game Finder`;
        this._infoCard.subtitle = `Steam : Game Finder is developed by Timothé Lapetite.<br>More infos & source : <a href="https://github.com/Nebukam/steam-game-finder">Github</a>`;

        let ctnr = ui.dom.El(`div`, { class: `ctnr` }, this._body);

        let text = new ui.manipulators.Text(ui.dom.El(`div`, { class: `title item` }, ctnr));
        text.Set(`Steam`);

        text = new ui.manipulators.Text(ui.dom.El(`div`, { class: `label item` }, ctnr));
        text.Set(`This app is not affiliated, associated, authorized, endorsed by, or in any way officially connected with Steam, `
            + `or any of its subsidiaries or its affiliates. `
            + `<br>The official Steam website can be found at <a href="https://store.steampowered.com/">https://store.steampowered.com/</a>.`);

        text = new ui.manipulators.Text(ui.dom.El(`div`, { class: `title item` }, ctnr));
        text.Set(`Co-optimus`);

        text = new ui.manipulators.Text(ui.dom.El(`div`, { class: `label item` }, ctnr));
        text.Set(`This app is not affiliated, associated, authorized, endorsed by, or in any way officially connected with Co-optimus, `
            + `or any of its subsidiaries or its affiliates. `
            + `<br>The official Steam website can be found at <a href="https://www.co-optimus.com/">https://www.co-optimus.com/</a>.`);

        /*
        let text = new ui.manipulators.Text(ui.dom.El(`div`, { class: `title item` }, p_container));
        text.Set(`About IsThereAnyDeal`);

        text = new ui.manipulators.Text(ui.dom.El(`div`, { class: `label item` }, p_container));
        text.Set(`This app is not affiliated, associated, authorized, endorsed by, or in any way officially connected with IsThereAnyDeal, `
            + `or any of its subsidiaries or its affiliates. `
            + `The official Steam website can be found at <a href="https://isthereanydeal.com/">https://isthereanydeal.com/</a>.`);
        */

    }

}

module.exports = AppInfosExplorer;
ui.Register(`sgf-appinfos`, AppInfosExplorer);