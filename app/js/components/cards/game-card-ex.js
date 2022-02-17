const nkm = require(`@nkmjs/core`);
const ui = nkm.ui;
const uilib = nkm.uilib;

const RemoteDataBlock = require(`../../data/remote-data-block`);
const SIGNAL = require(`../../signal`);
const GameCard = require(`./game-card`);

class GameCardEx extends GameCard {
    constructor() { super(); }

    static __default_headerPlacement = ui.FLAGS.LEFT;

    _Init() {
        super._Init();
        this._lastActiveUserCount = 0;
        this._mainView = null;  
    }

    set mainView(p_value) {
        this._mainView = p_value;
    }

    set group(p_value) {
        if (this._group == p_value) { return; }
        if (this._group) { this._group.RemoveGame(this); }
        this._group = p_value;
        if (this._group) { this._group.AddGame(this); }
    }

    _Style() {
        return nkm.style.Extends({
            ':host': {
                'cursor': 'pointer',
                'opacity': 0,
                'transition': 'opacity 0.5s',
                'height': '150px',
                'min-width': '250px',
                'max-width': '350px',
                '--header-size': '100px',
            },
            '.label': {
                'opacity': '0.5',
                'color': 'var(--col-warning)'
            }
        }, super._Style());
    }

    _Render() {
        super._Render();
    }

    _OnDataUpdated(p_data) {
        super._OnDataUpdated(p_data);

        if (this._lastActiveUserCount != p_data.activeUserCount) {
            this._Broadcast(SIGNAL.INFOS_UPDATED, this);
            this._lastActiveUserCount = p_data.activeUserCount;
            this._mainView._MoveToGroup(this, p_data.activeUserCount);
        }

    }

    _UpdateInfos() {

        super._UpdateInfos();

        let data = this._data;
        this.htitle = `Show infos for ${data.name}`;

        if(!this._isPainted){ return; }


        let
            users = nkm.env.APP.database._userReadyList,
            owners = [],
            leftOutUsers = [];
        for (let i = 0; i < users.count; i++) {
            let user = users.At(i);
            if (!data._users.includes(user)) { leftOutUsers.push(user); }
            else { owners.push(user) }
        }

        if (owners.length == 0) {
            this.subtitle = `Nobody owns it.`;
        } else
            if (leftOutUsers.length == 0) {
                this.subtitle = `Everybody owns it.`;
            } else if (owners.length == 1) {
                this.subtitle = `<b>${owners[0]._personaID}</b> owns it.`;
            }
            else if (owners.length == 2) {
                this.subtitle = `<b>${owners[0]._personaID}</b> and <b>${owners[1]._personaID}</b> own it.`;
            } else {
                let str = "";
                let max = owners.length - 1;
                for (var i = 0; i < max; i++) {
                    str += `<b>${owners[i]._personaID}</b>`;
                    if (i != max - 1) { str += ', '; }
                }
                str += ` and <b>${owners[max]._personaID}</b>`;
                this.subtitle = `${str} own it.`
            }

        if (leftOutUsers.length == 0) {
            this.label = ``;
        } else if (leftOutUsers.length == 1) {
            this.label = `<b>${leftOutUsers[0]._personaID}</b> doesn't.`;
        }
        else if (leftOutUsers.length == 2) {
            this.label = `<b>${leftOutUsers[0]._personaID}</b> and <b>${leftOutUsers[1]._personaID}</b> don't.`;
        } else {
            let str = "";
            let max = leftOutUsers.length - 1;
            for (var i = 0; i < max; i++) {
                str += `<b>${leftOutUsers[i]._personaID}</b>`;
                if (i != max - 1) { str += ', '; }
            }
            str += ` and <b>${leftOutUsers[max]._personaID}</b>`;
            this.label = `${str} don't.`
        }

    }

    _ShouldShow(p_data) { 
        return p_data.state == RemoteDataBlock.STATE_READY
        && p_data.activeUserCount > 0 
        && !p_data._parentGame
        && p_data.passFilters; 
    }

    _Launch() {
        nkm.env.APP._RequestGameInfos(this._data);
    }

    _Cleanup() {
        super._Cleanup();
    }

}

module.exports = GameCardEx;
ui.Register(`sgf-gamecard-ex`, GameCardEx);