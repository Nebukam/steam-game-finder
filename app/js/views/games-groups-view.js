const nkm = require(`@nkmjs/core`);
const u = nkm.u;
const ui = nkm.ui;

const comps = require(`../components`);
const SIGNAL = require(`../signal`);

const base = ui.views.View;
class GamesGroupsView extends base {
    constructor() { super(); }

    _Init() {
        super._Init();

        this._appmap = new nkm.collections.Dictionary();

        this._appctrls = new Array();
        this._appCtrlPool;

        this._groups = new Array();
        this._shortcutWidgets = new Array();

        nkm.env.APP.database.Watch(SIGNAL.USER_READY_ADDED, this._OnUserAdded, this);
        nkm.env.APP.database.Watch(SIGNAL.USER_READY_REMOVED, this._OnUserRemoved, this);

        nkm.env.APP.database.Watch(SIGNAL.GAME_ADDED, this._OnAppAdded, this);
        nkm.env.APP.database.Watch(SIGNAL.GAME_REMOVED, this._OnAppRemoved, this);

        this._gameListQueue = new Array();
        nkm.com.time.TIME.Watch(nkm.com.SIGNAL.TICK, this._OnTick, this);

        //nkm.com.Preload(comps.cards.GameCard, 1000);
        this._delayedDistribution = nkm.com.DelayedCall(this._Bind(this._Distribute));

    }

    static _Style() {
        return nkm.style.Extends({
            ':host': {
                'display': 'flex',
                'flex-flow': 'column nowrap'
            },
            '.pool': { 'display': 'none' },
            '.header': {
                'position': 'sticky',
                //'flex':'0 0 100px',
                //'top':'0',
                'display': 'flex',
                'flex-flow': 'row wrap',
                'padding': '20px',
                //'backdrop-filter':'blur(10px)',
                //'background-color':'rgba(0,0,0,0.35)'
            },
            '.info-card': {
                'flex': '1 1 auto',
            },
            '.ctnr': {
                'display': 'flex',
                'flex-flow': 'row nowrap',
                'flex': '1 1 auto',
                'min-height': 0
            },
            '.shortcut-ctnr': {
                'flex': '0 0 50px',
                'padding-top':'50px',
                'padding-bottom':'50px',
                'display': 'flex',
                'flex-flow': 'column-reverse nowrap',
                'align-content': 'center',
                'justify-content': 'center',
                'align-items': 'center'
            },
            '.shortcut': {
                'flex': '1 1 auto',
                'max-height': '33%'
            },
            '.shortcut:first-child': {
                'flex': '0 0 auto'
            },
            '.card-ctnr': {
                'flex': '1 1 auto',
                'display': 'flex',
                'align-content': 'start',
                //'justify-content':'space-evenly',
                'flex-flow': 'column nowrap',
                'padding': '8px 8px 0px 4px',
                'overflow-x': 'hidden',
                'overflow-y': 'overlay',
            },
            '.group':{
                'margin-bottom':'20px'
            },
            '.game-card': {
                'flex': '1 0 auto',
                'margin': '4px'
            }
        }, base._Style());
    }

    _Render() {
        super._Render();

        this._appCtrlPool = ui.dom.El('div', { class: 'pool' }, this);

        let ctnr = ui.dom.El('div', { class: 'ctnr' }, this);
        this._shortcutCtnr = ui.dom.El('div', { class: 'shortcut-ctnr' }, ctnr);
        this._cardCtnr = ui.dom.El('div', { class: 'card-ctnr' }, ctnr);

        //this._header = ui.dom.El('div', { class: 'header' }, this);

        //this._infoCard = this.Attach(comps.cards.InfoCard, 'info-card', this._header);

    }

    _OnAppAdded(p_data) {
        var ctrl = this._appmap.Get(p_data);
        if (ctrl || this._gameListQueue.includes(p_data)) { return; }
        this._gameListQueue.push(p_data);
    }

    _AddApp(p_app) {
        var ctrl = this._appmap.Get(p_app);

        if (ctrl) { return; }

        ctrl = this.Attach(comps.cards.GameCardEx, `game-card`, this._appCtrlPool);

        this._appmap.Set(p_app, ctrl);
        this._appctrls.push(ctrl);

        ctrl.mainView = this;
        ctrl.data = p_app;

        this._delayedDistribution.Schedule();
    }

    _OnAppRemoved(p_data) {
        this._RemoveApp(p_data);
    }

    _RemoveApp(p_app) {
        var ctrl = this._appmap.Get(p_app);
        if (!ctrl) { return; }
        this._appmap.Remove(p_app);
        this._appctrls.splice(this._appctrls.indexOf(ctrl), 1);
        ctrl.Release();
    }

    _OnTick() {

        //Check if items in queue
        let max = 5;
        let count = this._gameListQueue.length;
        if (count > max) { count = max; }

        for (var i = 0; i < count; i++) {
            let newGame = this._gameListQueue.shift();
            this._AddApp(newGame);
        }

    }

    _OnUserAdded(p_user) {
        let group = this.Attach(comps.GamesGroup, `group`, this._cardCtnr);
        group.index = this._groups.length;
        group.mainView = this;
        this._groups.push(group);

        let shortcut = this.Attach(comps.ShortcutWidget, `shortcut`, this._shortcutCtnr);
        shortcut.index = this._shortcutWidgets.length;
        shortcut.mainView = this;
        this._shortcutWidgets.push(shortcut);
    }

    _OnUserRemoved(p_user) {
        let group = this._groups.pop();
        group.Release();
        let shortcut = this._shortcutWidgets.pop();
        shortcut.Release();
    }

    _MoveToGroup(p_game, p_index) {
        let index = p_index - 1;
        if (index < 0) {
            this._ReturnGame(p_game);
        } else {
            this._groups[index].AddGame(p_game);
        }
    }

    _ReturnGame(p_appCtrl) {
        this.Attach(p_appCtrl, `game-card`, this._appCtrlPool);
        if (p_appCtrl.group) { p_appCtrl.group.RemoveGame(p_appCtrl); }
    }

    _Distribute() {

    }

}

module.exports = GamesGroupsView;
ui.Register(`sgf-gamesgroup`, GamesGroupsView);