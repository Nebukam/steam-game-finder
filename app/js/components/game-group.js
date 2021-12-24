const nkm = require(`@nkmjs/core`);
const ui = nkm.ui;
const uilib = nkm.uilib;

class GamesGroup extends ui.Widget {
    constructor() { super(); }

    static __usePaintCallback = true;

    _Init() {
        super._Init();

        this._gamelist = new nkm.collections.List();
        this._delayedUpdate = nkm.com.DelayedCall(this._Bind(this._UpdateInfos));

        nkm.com.time.TIME.Watch(nkm.com.SIGNAL.TICK, this._Bind(this._OnTick));
        nkm.env.APP.database.Watch(nkm.com.SIGNAL.UPDATED, this._delayedUpdate.Schedule);
        nkm.env.APP.filters.Watch(nkm.com.SIGNAL.UPDATED, this._delayedUpdate.Schedule);

        this._flags.Add(this, `sticky`);
        this._flags.Add(this, `redundant`);
        //TODO : 

        // - Group stats

    }

    set mainView(p_value) {
        this._mainView = p_value;
    }

    _Style() {
        return nkm.style.Extends({
            ':host': {
                'position': 'relative',
                'display': 'flex',
                'flex-flow': 'column nowrap',
                'flex': '1 0 auto',
                'padding-top': '100px',
                'margin-bottom': '50px',
                '--w': '150px'
            },
            '.field-id': {
                'flex': '1 1 auto'
            },
            '.btn-add': {
                'flex': '0 0 auto'
            },
            '.group-header': {
                'box-sizing': 'border-box',
                'position': 'absolute',
                'display': 'flex',
                'flex-flow': 'column wrap',
                'width': 'var(--w)',
                'top': '0px',
                'padding': '20px',
                'border-radius': '10px',
                'background-color': 'rgba(50,50,50,0.5)'
            },
            ':host(.sticky) .group-header': {
                'position': 'fixed',
                'top': '34px',
                'z-index': 1,
                'backdrop-filter': 'blur(10px)',
                'border-radius': '0 0 10px 10px',
            },
            '.group-body': {
                'display': 'flex',
                'flex-flow': 'row wrap',
                //'justify-content':'space-evenly',
            },
            ':host(.redundant)':{
                'opacity': '0.5',
            },
            ':host(.redundant) .group-body':{
                'display': 'none',
            },
            '.game-card': {
                'flex': '1 0 auto',
                'margin': '4px'
            }


        }, super._Style());
    }

    _Render() {
        super._Render();

        let header = ui.El(`div`, { class: `group-header` }, this._host);

        let title = new ui.manipulators.Text(ui.dom.El(`div`, { class: `title font-large` }, header));
        title.Set(`Group`); this._title = title;

        let subtitle = new ui.manipulators.Text(ui.dom.El(`div`, { class: `label` }, header));
        subtitle.Set(`Waiting for data...`); this._subtitle = subtitle;

        this._groupBody = ui.El(`div`, { class: `group-body` }, this._host);
    }

    set index(p_value) {
        this._index = p_value;
        this.style.setProperty(`--order`, 100 - p_value);
        if(p_value == 0){
            this._title.Set(`SINGLE OWNER`);
        }else{
            this._title.Set(`${p_value + 1} OWNERS`);
        }
        
    }

    AddGame(p_game) {
        this._gamelist.Add(p_game);
        this.Add(p_game, `game-card`, this._groupBody);
        if (p_game.group) { p_game.group.RemoveGame(p_game); }
        p_game.group = this;
        p_game.order = this._offsetOrder++;
        this._delayedUpdate.Schedule();
    }

    RemoveGame(p_game) {
        this._gamelist.Remove(p_game);
        if (p_game.parent == this) { this._mainView._ReturnGame(p_game); }
        this._delayedUpdate.Schedule();
    }

    _UpdateInfos() {

        if((this._index+1) == nkm.env.APP.database._userReadyList.count){
            this._subtitle.Set(`Everybody owns these games, they're shown in the other tab ;)`);
            this._flags.Set(`redundant`, true);
            return;
        }

        this._flags.Set(`redundant`, false);

        let
            groupTotal = this._gamelist.count,
            groupShown = 0;
        for (let i = 0; i < groupTotal; i++) {
            let game = this._gamelist.At(i);
            if (game._ShouldShow(game.data)) { groupShown++; }
        }
        
        if (groupShown == 0 && groupTotal != 0) {
            this._subtitle.Set(`Active filters have ruled out every game out of ${groupTotal} possibilities.`);
        } else if (groupShown == groupTotal) {
            this._subtitle.Set(`That's ${groupShown} games.`);
        } else {
            this._subtitle.Set(`${groupShown}/${groupTotal}. (narrowed down through filters.)`);
        }
        

    }

    _CleanUp() {

        for (let i = 0; i < this._gamelist.count; i++) {
            let game = this._gamelist.At(i);
            game.group = null;
            this._mainView._ReturnGame(game);
        }

        this._offsetOrder = 0;
        this._gamelist.Clear();
        this._mainView = null;
        super._CleanUp();
    }

    _OnTick() {

        if (!this._isPainted) { return; }

        let stick = false;
        let rect = ui.dom.Rect(this, this._parent);

        if (rect.y < 0) {
            let availSpace = rect.y + rect.height;
            if (availSpace > 100) {
                //stick
                stick = true;
            } else {
                //unstick
            }
        } else {
            //unstick
        }

        this._flags.Set(`sticky`, stick);
        this.style.setProperty(`--w`, `${rect.width}px`);

    }


}

module.exports = GamesGroup;
ui.Register(`sgf-gamegroup`, GamesGroup);