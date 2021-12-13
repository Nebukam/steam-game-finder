const nkm = require(`@nkmjs/core`);
const u = nkm.utils;
const ui = nkm.ui;

const comps = require(`../components`);

class GamesListView extends ui.views.View {
    constructor() { super(); }

    _Init() {
        super._Init();
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

        for(let i = 0; i < 30; i++){
            let card = this.Add(comps.GameCard, `game-card`, this._cardCtnr);
            card.title = "Game title";
            //card.subtitle = "Private profile";
            //card.label = "{xxx} games in library";
        }
    }

}

module.exports = GamesListView;
ui.Register(`sgf-gameslist`, GamesListView);