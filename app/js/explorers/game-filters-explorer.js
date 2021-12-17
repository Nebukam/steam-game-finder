const nkm = require(`@nkmjs/core`);
const u = nkm.utils;
const ui = nkm.ui;

const comps = require(`../components`);
const SIGNAL = require(`../data/signal`);


class GameFiltersExplorer extends nkm.uiworkspace.Explorer {
    constructor() { super(); }

    _Init() {

        super._Init();
        this._filtermap = new nkm.collections.Dictionary();

        nkm.env.features.Watch(nkm.env.SIGNAL.DISPLAY_TYPE_CHANGED, this._OnDisplayTypeChanged, this);
        nkm.env.APP.database.Watch(SIGNAL.INFOS_UPDATED, this._OnInfosUpdated, this);

    }

    _OnDisplayTypeChanged(p_newMode, p_oldMode) {
        if (p_newMode == nkm.env.ENV_DISPLAY.MOBILE) {
            this.style.setProperty(`--panelWidth`, `100%-50px`);
        } else {
            delete this.style.removeProperty(`--panelWidth`);
        }
    }

    _Style() {
        return nkm.style.Extends({
            ':host': {
                '--panelWidth': '325px',
                'width': 'var(--panelWidth)',
            },
            '.header, .footer': {
                'padding': '10px',
            },
            '.body': {
                'padding': '0px 8px 0px 4px',
                'webkit-box-shadow':'none',
                'box-shadow':'none'
            },
            '.filter-item': {
                'margin-bottom': '4px',
            },
            '.show-all': {
                'margin-bottom':'45px'
            },
            '.show-all::after': {
                'position':'absolute',
                'content':'"Show games that are..."',
                'font-weight':'100',
                'margin-top':'45px'
            }


        }, super._Style());
    }

    _Render() {

        super._Render();

        let showAll = this.Add(comps.FilterWidget, `filter-item show-all`, this._body);
        showAll.sourceEnum = nkm.env.APP.database._filterShowAll;

        var enums = nkm.env.APP.database._enums;
        for (var i = 0; i < enums.length; i++) {
            let e = enums[i];
            let toggle = this.Add(comps.FilterWidget, `filter-item`, this._body);
            toggle.sourceEnum = e;
            this._filtermap.Set(e, toggle);
        }

    }

    _OnInfosUpdated(){

        if(nkm.env.APP.database._filterShowAll.flag){
            let keys = this._filtermap.keys;
            for(var i = 0; i < keys.length; i++){
                this._filtermap.Get(keys[i])._flags.Set(`not-used`, true);
            }
        }else{
            let keys = this._filtermap.keys;
            for(var i = 0; i < keys.length; i++){
                this._filtermap.Get(keys[i])._flags.Set(`not-used`, false);
            }
        }

    }

    //#endregion

}

module.exports = GameFiltersExplorer;
ui.Register(`sgf-gamefilters`, GameFiltersExplorer);