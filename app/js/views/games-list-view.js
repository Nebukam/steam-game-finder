const nkm = require(`@nkmjs/core`);
const u = nkm.utils;
const ui = nkm.ui;

const comps = require(`../components`);
const SIGNAL = require(`../data/signal`);

class GamesListView extends ui.views.View {
    constructor() { super(); }

    _Init() {
        super._Init();

        this._gamemap = new nkm.collections.Dictionary();
        this._gamectrls = new Array();

        nkm.env.APP.database.Watch(SIGNAL.GAME_ADDED, this._OnGameAdded, this);
        nkm.env.APP.database.Watch(SIGNAL.GAME_REMOVED, this._OnGameRemoved, this);
        nkm.env.APP.database.Watch(SIGNAL.INFOS_UPDATED, this._OnInfosUpdated, this);

    }

    _Style() {
        return nkm.style.Extends({
            ':host': {

            },
            '.game-card-ctnr':{
                'flex':'1 1 auto',
                'display':'flex',
                'flex-flow':'row wrap',
                'padding':'0px 8px 0px 4px'
            },
            '.game-card': {
                'flex':'1 0 auto',
                'margin':'4px'
            }
        }, super._Style());
    }

    _Cleanup(){
        super._Cleanup();
        console.log(`Cleanup !`);
    }


    _Render(){
        super._Render();

        this._cardCtnr = u.dom.El('div', { class:'game-card-ctnr' }, this);
        /*
        for(let i = 0; i < 30; i++){
            let card = this.Add(comps.GameCard, `game-card`, this._cardCtnr);
            card.title = "Game title";
            //card.subtitle = "Private profile";
            //card.label = "{xxx} games in library";
        }
        */
    }

    _OnGameAdded(p_data){
        var ctrl = this._gamemap.Get(p_data);
        if(ctrl){return;}
        ctrl = this.Add(comps.GameCard, `game-card`, this._cardCtnr);
        ctrl.data = p_data;
        this._gamemap.Set(p_data, ctrl);
        this._gamectrls.push(ctrl);
    }

    _OnGameRemoved(p_data){
        var ctrl = this._gamemap.Get(p_data);
        if(!ctrl){return;}
        this._gamemap.Remove(p_data);
        this._gamectrls.splice(this._gamectrls.indexOf(ctrl), 1);
        ctrl.Release();
    }

    _OnInfosUpdated(){
        
        if(ENV.APP._DB._userMap.count == 0){
            for(var i = 0, n = this._gamectrls.length; i < n; i++){
                this._gamectrls[i].visible = false;
            }
        }else{
            var ctrl;
            for(var i = 0, n = this._gamectrls.length; i < n; i++){
                ctrl = this._gamectrls[i];
                ctrl.visible = ctrl.data.shouldShow;
            }
        }
        
    }

}

module.exports = GamesListView;
ui.Register(`sgf-gameslist`, GamesListView);