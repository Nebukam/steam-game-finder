const nkm = require(`@nkmjs/core`);
const u = nkm.utils;
const ui = nkm.ui;

const comps = require(`../components`);
const SIGNAL = require(`../signal`);

class GamesGroupsView extends ui.views.View {
    constructor() { super(); }

    _Init() {
        super._Init();

        this._appmap = new nkm.collections.Dictionary();
        this._appctrls = new Array();

        nkm.env.APP.database.Watch(SIGNAL.GAME_ADDED, this._OnAppAdded, this);
        nkm.env.APP.database.Watch(SIGNAL.GAME_REMOVED, this._OnAppRemoved, this);

        this._gameListQueue = new Array();
        nkm.com.time.TIME.Watch( nkm.com.SIGNAL.TICK, this._OnTick, this );

        //nkm.com.Preload(comps.GameCard, 1000);

    }

    _Style() {
        return nkm.style.Extends({
            ':host': {
                'display':'flex',
                'flex-flow':'column nowrap'
            },
            '.header':{
                'position':'sticky',
                //'flex':'0 0 100px',
                //'top':'0',
                'display':'flex',
                'flex-flow':'row wrap',
                'padding':'20px',
                //'backdrop-filter':'blur(10px)',
                //'background-color':'rgba(0,0,0,0.35)'
            },
            '.info-card':{
                'flex':'1 1 auto',
            },

            '.card-ctnr':{
                'flex':'1 1 auto',
                'display':'flex',
                'align-content': 'start',
                //'justify-content':'space-between',
                'flex-flow':'row wrap',
                'padding':'8px 8px 0px 4px',
                'overflow-x': 'hidden',
                'overflow-y': 'overlay',
            },            
            '.game-card': {
                'flex':'1 0 auto',
                'margin':'4px'
            }
        }, super._Style());
    }

    _Render(){
        super._Render();

        
        this._cardCtnr = ui.dom.El('div', { class:'card-ctnr' }, this);
        this._header = ui.dom.El('div', { class:'header' }, this);        

        this._infoCard = this.Add(comps.InfoCard, 'info-card', this._header);

    }

    _OnAppAdded(p_data){
        var ctrl = this._appmap.Get(p_data);
        if(ctrl || this._gameListQueue.includes(p_data)){return;}
        this._gameListQueue.push(p_data);
    }

    _AddApp(p_app){
        var ctrl = this._appmap.Get(p_app);
        if(ctrl){return;}
        ctrl = this.Add(comps.GameCard, `game-card`, this._cardCtnr);
        ctrl.data = p_app;
        this._appmap.Set(p_app, ctrl);
        this._appctrls.push(ctrl);
    }

    _OnAppRemoved(p_data){
        this._RemoveApp(p_data);
    }

    _RemoveApp(p_app){
        var ctrl = this._appmap.Get(p_app);
        if(!ctrl){return;}
        this._appmap.Remove(p_app);
        this._appctrls.splice(this._appctrls.indexOf(ctrl), 1);
        ctrl.Release();
    }

    _OnTick(){

        //Check if items in queue
        let max = 10;
        let count = this._gameListQueue.length;
        if(count > max){ count = max; }

        for(var i = 0; i < count; i++){
            let newGame = this._gameListQueue.shift();
            this._AddApp(newGame);
        }

    }

}

module.exports = GamesGroupsView;
ui.Register(`sgf-gamesgroup`, GamesGroupsView);