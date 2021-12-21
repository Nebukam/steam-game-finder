const { uilib, com } = require("@nkmjs/core");
const nkm = require(`@nkmjs/core`);
const u = nkm.utils;
const ui = nkm.ui;

const comps = require(`../components`);
const SIGNAL = require(`../data/signal`);

const _flag_showAll = `show-all`;
const _flag_showCooptimus = `show-cooptimus`;


class GameFiltersExplorer extends nkm.uiworkspace.Explorer {
    constructor() { super(); }

    _Init() {

        super._Init();
        this._filtermap = new nkm.collections.Dictionary();

        nkm.env.features.Watch(nkm.env.SIGNAL.DISPLAY_TYPE_CHANGED, this._OnDisplayTypeChanged, this);
        nkm.env.APP.database.Watch(SIGNAL.INFOS_UPDATED, this._OnInfosUpdated, this);

        this._flags.Add(this, _flag_showAll, _flag_showCooptimus);

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
            ':host(.show-all) .regular': {
                'display': 'none'
            },
            ':host(.show-cooptimus) .cooptimus': {
                'display': 'none'
            },
            '.header, .footer': {
                'display': 'none'
            },
            '.body': {
                'padding': '0px 8px 0px 4px',
                'webkit-box-shadow': 'none',
                'box-shadow': 'none',
                'display': 'flex',
                'flex-flow': 'row wrap',
                'align-items': 'center',
                'align-content': 'flex-start'
            },
            '.box': {
                'flex': '1 1 80%',
                'display': 'flex',
                'flex-flow': 'row wrap',
                'align-items': 'center',
                'align-content': 'flex-start'
            },
            '.filter-item': {
                'min-height': 0,
                'margin': '4px',
                'flex': '1 1 33%'
            },
            '.small-filter': {
                'flex': ''
            },
            '.label': {
                'margin': '10px',
                'margin-top': '0px',
                'padding-top': '10px',
                'font-weight': '900',
                'flex': '1 1 66%',
                'border-top': '2px solid rgba(140,140,140,0.15)',
                'display': 'flex',
                'flex-flow': 'row wrap',
                'align-items': 'center',
                'align-content': 'flex-start'
            },
            '.btn': {
                'margin-left': '10px'
            },
            '.small-label': {
                'margin': '4px',
                'margin-left': '10px',
                'width': '100%',
                'font-style': 'italic',
                'font-size': 'var(--font-size-xs)',
                'border-top': '1px solid rgba(140,140,140,0.15)',
                'text-align': 'center',
                'padding-top': '8px'
            }


        }, super._Style());
    }

    _Render() {

        super._Render();

        //#region Regular filters

        let label = new ui.manipulators.Text(ui.dom.El(`div`, { class: `label` }, this._body));
        label.Set(`Basic filters`);

        // Show all

        let showAll = this.Add(comps.FilterWidget, `filter-item`, this._body);
        showAll.size = ui.FLAGS.SIZE_XS;
        showAll.sourceEnum = nkm.env.APP.database._filterShowAll;
        showAll._flavor.Set(nkm.com.FLAGS.WARNING);
        showAll._updateFn = nkm.env.APP.database._UpdateToggles;

        this.regFBox = ui.dom.El(`div`, { class: `box regular` }, this._body);

        // Exclusive
        let fExc = this.Add(comps.FilterWidget, `filter-item`, this.regFBox);
        fExc.size = ui.FLAGS.SIZE_XS;
        fExc.sourceEnum = nkm.env.APP.database._filterExclusive;
        fExc._flavor.Set(nkm.com.FLAGS.WARNING);
        fExc._updateFn = nkm.env.APP.database._UpdateToggles;

        let enums = nkm.env.APP.database._enums;
        let labels = ["Basics", "PVP", "Co-Op", "Misc"], labelIndex = 0;
        for (var i = 0; i < enums.length; i++) {
            if (i == 0 || i == 2 || i == 6 || i == 10) {
                label = new ui.manipulators.Text(ui.dom.El(`div`, { class: `small-label` }, this.regFBox));
                label.Set(labels[labelIndex++]);
            }
            this._AddFilter(enums[i], this.regFBox, nkm.env.APP.database._UpdateFilters);
        }

        //#endregion

        //#region Cooptimus filters

        label = new ui.manipulators.Text(ui.dom.El(`div`, { class: `label` }, this._body));
        label.Set(`Co-optimus`);

        let cooptimusLink = this.Add(uilib.buttons.Tool, `btn`, label.element);
        cooptimusLink.options = {
            trigger: { fn: () => { window.open('https://www.co-optimus.com/', '_blank'); } },
            flavor: com.FLAGS.INFOS, variant: ui.FLAGS.MINIMAL, icon: 'infos', size: ui.FLAGS.SIZE_XS,
            htitle: 'Go to Co-optimus website'
        }

        let enableCooptimus = this.Add(comps.FilterWidget, `filter-item show-all`, this._body);
        enableCooptimus.size = ui.FLAGS.SIZE_XS;
        enableCooptimus.sourceEnum = nkm.env.APP.database._filterUseCooptimus;
        enableCooptimus._flavor.Set(nkm.com.FLAGS.WARNING);
        enableCooptimus._updateFn = nkm.env.APP.database._UpdateToggles;

        this.coopFBox = ui.dom.El(`div`, { class: `box cooptimus` }, this._body);

        enums = nkm.env.APP.database._cooptimusEnums;
        labels = ["Local", "Online", "LAN", "Other"]; labelIndex = 0;
        for (var i = 0; i < enums.length; i++) {
            if (i == 0 || i == 2 || i == 4 || i == 6) {
                label = new ui.manipulators.Text(ui.dom.El(`div`, { class: `small-label` }, this.coopFBox));
                label.Set(labels[labelIndex++]);
            }
            this._AddFilter(enums[i], this.coopFBox, nkm.env.APP.database._UpdateCoopFilters);
        }

        //#endregion

    }

    _AddFilter(p_enum, p_parent, p_updateFn) {

        let type = comps.FilterWidget;
        if (p_enum.values) { type = comps.SliderFilterWidget; }

        let toggle = this.Add(type, `filter-item small-filter`, p_parent);

        toggle.size = ui.FLAGS.SIZE_XS;
        toggle.sourceEnum = p_enum;
        toggle._updateFn = p_updateFn;
        this._filtermap.Set(p_enum, toggle);

    }

    _OnInfosUpdated() {

        let showAll = nkm.env.APP.database._filterShowAll.flag;
        let useCooptimus = nkm.env.APP.database._filterUseCooptimus.flag;

        this._flags.Set(_flag_showAll, showAll);
        this._flags.Set(_flag_showCooptimus, !useCooptimus);

    }

    //#endregion

}

module.exports = GameFiltersExplorer;
ui.Register(`sgf-gamefilters`, GameFiltersExplorer);