const { uilib, com } = require(`@nkmjs/core`);
const nkm = require(`@nkmjs/core`);
const u = nkm.utils;
const ui = nkm.ui;

const comps = require(`../components`);
const SIGNAL = require(`../signal`);

const _flag_showAll = `show-all`;
const _flag_showCooptimus = `show-cooptimus`;
const _flag_showSpecs = `show-specs`;
const _flag_showTags = `show-tags`;


class GameFiltersExplorer extends nkm.uiworkspace.Explorer {
    constructor() { super(); }

    _Init() {

        super._Init();
        this._filtermap = new nkm.collections.Dictionary();

        //nkm.env.features.Watch(nkm.env.SIGNAL.DISPLAY_TYPE_CHANGED, this._OnDisplayTypeChanged, this);
        nkm.env.APP.filters.Watch(nkm.com.SIGNAL.UPDATED, this._OnFiltersUpdated, this);

        this._flags.Add(this, _flag_showAll, _flag_showCooptimus, _flag_showSpecs, _flag_showTags);

    }

    _PostInit() {
        super._PostInit();
        this._OnFiltersUpdated(nkm.env.APP.filters);
    }
/*
    _OnDisplayTypeChanged(p_newMode, p_oldMode) {
        if (p_newMode == nkm.env.ENV_DISPLAY.MOBILE) {
            this.style.setProperty(`--panelWidth`, `calc(100% - 25px)`);
        } else {
            delete this.style.removeProperty(`--panelWidth`);
        }
    }
*/
    _Style() {
        return nkm.style.Extends({
            ':host': {
                'max-width': '325px',
            },
            ':host(.show-all) .regular': {
                'display': 'none'
            },
            ':host(.show-cooptimus) .cooptimus': {
                'display': 'none'
            },
            ':host(.show-specs) .specs': {
                'display': 'none'
            },
            ':host(.show-tags) .tags': {
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
                'flex': '1 1 auto'
            },
            '.small-filter': {
                'flex': '1 1 auto'
            },
            '.large-filter': {
                'flex': '1 1 66%'
            },
            '.title': {
                'margin': '10px',
                'margin-top': '0px',
                'padding-top': '20px',
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

        let filters = nkm.env.APP.filters;

        //#region Regular filters

        let label = new ui.manipulators.Text(ui.dom.El(`div`, { class: `title` }, this._body));
        label.Set(`Basic filters`); this._labelBasicFilters = label;

        // Show all
        this._AddToggle(filters.toggles._toggleBasics, this.regFBox);

        this.regFBox = ui.dom.El(`div`, { class: `box regular` }, this._body);

        // Exclusive
        this._AddToggle(filters.toggles._toggleExclusive, this.regFBox);

        let enums = filters.regular._filters;
        for (var i = 0; i < enums.length; i++) {
            this._AddFilter(enums[i], this.regFBox);
        }

        //#endregion

        //#region Cooptimus filters

        label = new ui.manipulators.Text(ui.dom.El(`div`, { class: `title` }, this._body));
        label.Set(`Co-optimus`); this._labelCoopFilters = label;

        let cooptimusLink = this.Add(uilib.buttons.Tool, `btn`, label.element);
        cooptimusLink.options = {
            trigger: { fn: () => { window.open('https://www.co-optimus.com/', '_blank'); } },
            flavor: com.FLAGS.INFOS, variant: ui.FLAGS.MINIMAL, icon: 'infos', size: ui.FLAGS.SIZE_XS,
            htitle: 'Go to Co-optimus website'
        }

        this._AddToggle(filters.toggles._toggleCooptimus);

        this.coopFBox = ui.dom.El(`div`, { class: `box cooptimus` }, this._body);

        enums = filters.cooptimus._filters;
        for (var i = 0; i < enums.length; i++) {
            this._AddFilter(enums[i], this.coopFBox);
        }

        //#endregion

        //#region Specs filters

        label = new ui.manipulators.Text(ui.dom.El(`div`, { class: `title` }, this._body));
        label.Set(`Technical filters`);

        this._AddToggle(filters.toggles._toggleSpecs);

        this.specsFBox = ui.dom.El(`div`, { class: `box specs` }, this._body);

        enums = filters.specs._filters;
        for (var i = 0; i < enums.length; i++) {
            this._AddFilter(enums[i], this.specsFBox);
        }

        //#endregion

        //#region Tags filters

        filters.tags.Watch(com.SIGNAL.READY, this._OnTagLoaded, this);

        //#endregion

    }

    _OnTagLoaded(){
        
        console.log(`_OnTagLoaded`);
        let filters = nkm.env.APP.filters;

        let label = new ui.manipulators.Text(ui.dom.El(`div`, { class: `title` }, this._body));
        label.Set(`Filters by tags`);

        this._AddToggle(filters.toggles._toggleTags);

        this.tagsBox = ui.dom.El(`div`, { class: `box tags` }, this._body);

        let enums = filters.tags._filters;

        for (var i = 0; i < enums.length; i++) {
            this._AddFilter(enums[i], this.tagsBox);
        }

        console.log(`Huoh`);

    }

    _AddToggle(p_enum, p_ctnr) {
        let toggle = this.Add(comps.filters.FilterWidget, `filter-item`, (p_ctnr || this._body));
        toggle.size = ui.FLAGS.SIZE_XS;
        toggle.sourceEnum = p_enum;
        toggle._flavor.Set(nkm.com.FLAGS.WARNING);
        return toggle;
    }

    _AddFilter(p_enum, p_parent) {


        let classes = `filter-item `;
        let type = comps.filters.FilterWidget;

        if (p_enum.values) { type = comps.filters.SliderFilterWidget; classes += `large-filter`; }
        else { 
            if(p_enum.isTag){ type = comps.filters.FilterTagWidget; }
            classes += `small-filter` }

        this._GroupLabel(p_enum.group, p_parent);

        let toggle = this.Add(type, classes, p_parent);

        toggle.size = ui.FLAGS.SIZE_XS;
        toggle.sourceEnum = p_enum;
        this._filtermap.Set(p_enum, toggle);

    }

    _GroupLabel(p_label, p_container) {
        if (this._lastLabel == p_label) { return; }
        this._lastLabel = p_label;
        let label = new ui.manipulators.Text(ui.dom.El(`div`, { class: `small-label` }, p_container));
        label.Set(p_label);
    }

    _OnFiltersUpdated(p_filters) {

        let useBasics = p_filters.toggles.isBasicsEnabled;
        let useCooptimus = p_filters.toggles.isCooptimusEnabled;
        let useSpecs = p_filters.toggles.isSpecsEnabled;
        let useTags = p_filters.toggles.isTagsEnabled;

        this._flags.Set(_flag_showAll, !useBasics);
        this._flags.Set(_flag_showCooptimus, !useCooptimus);
        this._flags.Set(_flag_showSpecs, !useSpecs);
        this._flags.Set(_flag_showTags, !useTags);

        /*
        this._labelBasicFilters.Set(`Basic filters (${p_filters.regular._lastMatchCount} results)`);

        if (useCooptimus) {
            this._labelCoopFilters.Set(`Co-optimus (${p_filters.cooptimus._lastMatchCount} results)`);
        } else {
            this._labelCoopFilters.Set(`Co-optimus`);
        }
*/


    }

    //#endregion

}

module.exports = GameFiltersExplorer;
ui.Register(`sgf-gamefilters`, GameFiltersExplorer);