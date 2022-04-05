'use strict';

const nkm = require(`@nkmjs/core`);
const u = nkm.u;
const collections = nkm.collections;

const FilterGroup = require(`./filter-group`);

class GroupToggles extends FilterGroup {

    constructor() { super(); }

    _Init() {
        super._Init();
        this._id = `filterlist-toggles`;

        this._Bind(this._OnRegularUpdated);
        this._Bind(this._OnSpecsUpdated);
        this._Bind(this._OnCoopUpdated);
        this._Bind(this._OnTagsUpdated);

        this._toggleExclusive = this._Add({ key: 1, flag: false, id: `Exact matches only` });
        this._toggleBasics = this._Add({ key: 2, flag: false, id: `Enable` });
        this._toggleCooptimus = this._Add({ key: 3, flag: false, id: `Enable` });
        this._toggleSpecs = this._Add({ key: 4, flag: false, id: `Enable` });
        this._toggleTags = this._Add({ key: 5, flag: false, id: `Enable` });
        this._toggleTagsExclusive = this._Add({ key: 6, flag: false, id: `Exact matches only` });

        this._toggleExclusive._updateFn = this._OnRegularUpdated;
        this._toggleBasics._updateFn = this._OnRegularUpdated;
        this._toggleSpecs._updateFn = this._OnSpecsUpdated;
        this._toggleCooptimus._updateFn = this._OnCoopUpdated;
        this._toggleTags._updateFn = this._OnTagsUpdated;
        this._toggleTagsExclusive._updateFn = this._OnTagsUpdated;

    }

    get isBasicsEnabled(){ return this._toggleBasics.flag; }
    get isExclusiveEnabled(){ return this._toggleExclusive.flag; }
    get isSpecsEnabled(){ return this._toggleSpecs.flag; }
    get isCooptimusEnabled(){ return this._toggleCooptimus.flag; }    
    get isTagsEnabled(){ return this._toggleTags.flag; } 
    get isTagExclusiveEnabled(){ return this._toggleTagsExclusive.flag; } 

    _Check(p_app) { return true; }

    _ReadCache( p_item ){
        let filter = this._map.Get(`${p_item.key}`);
        if (!filter) { return; }
        filter.flag = p_item.flag;
    }

    _WriteCache( p_item ){
        return {
            key: p_item.key,
            flag: p_item.flag
        };
    }

    _OnRegularUpdated(){
        this._OnFilterUpdated();
        nkm.env.APP.filters.regular._OnFilterUpdated();
    }

    _OnSpecsUpdated(){
        this._OnFilterUpdated();
        nkm.env.APP.filters.specs._OnFilterUpdated();
    }

    _OnCoopUpdated(){
        this._OnFilterUpdated();
        nkm.env.APP.filters.cooptimus._OnFilterUpdated();
    }

    _OnTagsUpdated(){
        this._OnFilterUpdated();
        nkm.env.APP.filters.tags._OnFilterUpdated();
    }

}

module.exports = GroupToggles;