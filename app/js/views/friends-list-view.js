const nkm = require(`@nkmjs/core`);
const u = nkm.utils;
const ui = nkm.ui;

const comps = require(`../components`);

class FriendsListView extends ui.views.View {
    constructor() { super(); }

    _Init() {
        super._Init();
    }

    _Style() {
        return nkm.style.Extends({
            ':host': {
                'display':'flex',
                'flex-flow':'column nowrap'
            },
            '.header':{
                //'height':'100px',
                'flex':'0 0 100px',
            },
            '.game-card-ctnr':{
                'flex':'1 1 auto',
                'display':'flex',
                'flex-flow':'row wrap',                
                'padding':'0px 8px 0px 4px',
                'overflow-x': 'hidden',
                'overflow-y': 'overlay',
            },
            '.user-card': {
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

        this._header = u.dom.El('div', { class:'header' }, this);
        this._cardCtnr = u.dom.El('div', { class:'game-card-ctnr' }, this);

        for(let i = 0; i < 30; i++){
            let card = this.Add(comps.UserCard, `user-card`, this._cardCtnr);
            card.title = "Gamertag";
            //card.subtitle = "Private profile";
            //card.label = "{xxx} games in library";
        }
    }

    LoadFriendlist(p_user){
        this.RequestDisplay();
    }

}

module.exports = FriendsListView;
ui.Register(`sgf-friendslist`, FriendsListView);