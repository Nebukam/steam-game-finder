const nkm = require(`@nkmjs/core`);
const u = nkm.utils;
const ui = nkm.ui;
const uilib = nkm.uilib;

const comps = require(`../components`);
const SearchData = require("../data/search-data");

class SearchResultView extends uilib.overlays.Drawer {
    constructor() { super(); }

    _Init() {
        super._Init();
        this._searchResults = new Array();
    }

    _Style() {
        return nkm.style.Extends({
            ':host': {
                'width': '350px',
                //'width':'66%',
                'background-color':'rgba(61,61,61,0.5)',
                'backdrop-filter': 'blur(10px)'
                //'display':'flex',
                //'flex-flow':'column nowrap'
            },
            '.header': {
                'flex': '0 0 100px',
            },
            '.card-ctnr': {
                'flex': '1 1 auto',
                'display': 'flex',
                'flex-flow': 'row wrap',
                'padding': '0px 8px 0px 4px',
                'overflow-x': 'hidden',
                'overflow-y': 'overlay',
            },
            '.user-card': {
                'flex': '1 1 250px',
                'margin': '4px',               
            },
            '.info-card': {
                'flex': '1 1 auto',
                'margin': '4px',
                '--size':'100%'
            }
        }, super._Style());
    }

    _Cleanup() {
        super._Cleanup();
        console.log(`Cleanup !`);
    }


    _Render() {
        super._Render();

        this._header = ui.dom.El('div', { class: 'header' }, this._body);
        this._cardCtnr = ui.dom.El('div', { class: 'card-ctnr' }, this._body);

        this._infoCard = this.Add(uilib.cards.Icon, 'info-card', this._body);
        this._infoCard._mediaPlacement.Set(ui.FLAGS.TOP);

        //this._input = this.Add(comps.UserInputField, `input-field`, this._body);
    }

    _OnDataChanged(p_oldData) {
        
        super._OnDataChanged(p_oldData);

        if (!this._data) { return; }

        let userData = this._data.GetOption(`user`, null);

        if (!userData) { return; }

        window.open(`https://steamcommunity.com/search/users/#text=${userData.userid}`, '_blank');

        this._infoCard.icon = `infos`;
        this._infoCard.flavor = nkm.com.FLAGS.INFOS;
        this._infoCard.title = `Steam search`;
        this._infoCard.subtitle = `Once you found the profile you're looking for, close this panel, then copy-paste the profile' URL into the <b>add</b> field and click the [+].`;

        userData.Release();

    }

    _CleanUp() {
        super._CleanUp();
    }

}

module.exports = SearchResultView;
ui.Register(`sgf-search-results`, SearchResultView);