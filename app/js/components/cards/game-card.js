const nkm = require(`@nkmjs/core`);
const ui = nkm.ui;
const uilib = nkm.uilib;

const RemoteDataBlock = require(`../../data/remote-data-block`);
const SIGNAL = require(`../../signal`);
const MediaCardEx = require(`./media-card-ex`);

const _flag_dlc = 'dlc';

class GameCard extends MediaCardEx {
    constructor() { super(); }

    static __default_headerPlacement = ui.FLAGS.TOP;

    _Init() {
        super._Init();
        this._mediaPropertyName = `logo`;
    }

    _Style() {
        return nkm.style.Extends({
            ':host': {
                'cursor': 'pointer',
                'opacity': 0,
                'transition': 'opacity 0.5s',
                'width': '140px',
                'max-width': '180px',
                '--header-size': '225px',
            },
            ':host(.unpainted) .tags':{ 'display':'none' },
            ':host(.dlc) .header::before': {
                'position': 'absolute',
                'width': '100%',
                'height': '30px',
                'background-color': 'rgba(255,255,255,0.5)',
                'content': '"DLC"',
                'text-align': 'center',
                'padding-top': '10px',
                'color': 'black'
            },
            '.tags': {
                'display': 'flex',
                'padding': '5px'
            },
            '.tag': {
                'margin-right': '4px'
            },
            '.header': {
                'display': 'flex',
                'flex-flow': 'column nowrap',
            }
        }, super._Style());
    }

    _Render() {

        super._Render();

        this._tagsCtnr = ui.El(`div`, { class: `tags` }, this._frame.header.element);

        this._tagDiskSize = this.Attach(uilib.widgets.Tag, `tag disk-size`, this._tagsCtnr);
        //this._tagDiskSize.visible = false;
        this._tagDiskSize.label = `50 GB`;

        this._tagDLC = this.Attach(uilib.widgets.Tag, `tag dlc`, this._tagsCtnr);
        this._tagDLC.visible = false;
        this._tagDLC.flavor = nkm.com.FLAGS.INFOS;
        this._tagDLC.label = `DLC`;

    }

    _UpdateInfos() {

        if (!super._UpdateInfos()) { return false; }

        let data = this._data;

        if (data.state != RemoteDataBlock.STATE_READY) { return false; }

        this.htitle = `Launch ${data.name}`;

        if (this._toggle)
            this._toggle.currentValue = data.active;

        this.title = data.name;

        let subtitle = null;
        let variant = null;
        let flavor = null;

        //let label = p_data._privacy;
        switch (data.state) {
            case RemoteDataBlock.STATE_NONE:
                flavor = nkm.com.FLAGS.WARNING;
                break;
            case RemoteDataBlock.STATE_LOADING:
                subtitle = `loading...`;
                flavor = nkm.com.FLAGS.LOADING;
                break;
            case RemoteDataBlock.STATE_READY:
                //subtitle = `${p_data.gamesCount} games in library`;
                break;
            case RemoteDataBlock.STATE_INVALID:
                flavor = nkm.com.FLAGS.ERROR;
                break;
        }

        this.flavor = flavor;
        this.variant = variant;
        this.subtitle = subtitle;

        let childCount = data._childs.length;
        if (childCount > 0) {
            if (childCount == 1) {
                this.label = `${childCount} DLC`;
            } else {
                this.label = `${childCount} DLCs`;
            }
        }

        this._tagDLC.visible = data._parentGame ? true : false;

        //this.order = data.order;
        if (data._parentGame) {
            this._tagDLC.visible = true;
        }

        if (data._specs) {
            this._tagDiskSize.visible = true;
            let val = data._specs.storage;
            if (val < 1) { val = `${val * 1000} MB`; }
            else { val = `${val} GB`; }
            this._tagDiskSize.label = val;
        } else {
            this._tagDiskSize.visible = false;
        }

        return true;

    }

    _ShouldShow(p_data) {
        return p_data.state == RemoteDataBlock.STATE_READY
            && p_data.activeUserCount > 0
            && p_data.passFilters
            && p_data.passOverlap;
    }

    Activate(p_evt) {
        if (!super.Activate(p_evt)) { return false; }
        this._Launch();
        return true;
    }

    _Launch() {
        var url = `steam://run/${this._data.appid}/`;
        window.open(url);
    }

}

module.exports = GameCard;
ui.Register(`sgf-gamecard`, GameCard);