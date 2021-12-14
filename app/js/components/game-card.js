const nkm = require(`@nkmjs/core`);
const u = nkm.utils;
const ui = nkm.ui;
const uiworkspace = nkm.uiworkspace;
const uilib = nkm.uilib;

const RemoteDataBlock = require(`../data/remote-data-block`);

class GameCard extends uilib.cards.Media {
    constructor() { super(); }

    _Init() {
        super._Init();
        this._orientation.Set(ui.FLAGS.VERTICAL);
        this._mediaPlacement.Set(ui.FLAGS.TOP);
    }

    _Style() {
        return nkm.style.Extends({
            ':host': {
                'width': '150px',
                '--header-size': '225px'
                //margin:'10px'
            },
        }, super._Style());
    }

    _Render() {
        super._Render();
        //new ui.manipulators.Text(u.El(`p`, {}, this._header)).Set(u.tils.CamelSplit(this.constructor.name));

    }

    _OnDataUpdated(p_data) {

        super._OnDataUpdated(p_data);

        if (this._toggle)
            this._toggle.currentValue = p_data.active;

        //this.media = (p_data._logo || nkm.style.URLImgs(`placeholder-dark.png`));
        this.title = p_data._name;


        let subtitle = null;
        let variant = null;
        let flavor = null;

        //let label = p_data._privacy;
        switch (this._data.state) {
            case RemoteDataBlock.STATE_NONE:
                flavor = nkm.common.FLAGS.WARNING;
                break;
            case RemoteDataBlock.STATE_LOADING:
                subtitle = `loading...`;
                flavor = nkm.common.FLAGS.LOADING;
                break;
            case RemoteDataBlock.STATE_READY:
                //subtitle = `${p_data.gamesCount} games in library`;
                break;
            case RemoteDataBlock.STATE_INVALID:
                flavor = nkm.common.FLAGS.ERROR;
                break;
        }

        this.flavor = flavor;
        this.variant = variant;

        this.subtitle = subtitle;
        //this.label = label;

    }

}

module.exports = GameCard;
ui.Register(`sgf-gamecard`, GameCard);