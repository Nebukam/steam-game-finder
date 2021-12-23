const nkm = require(`@nkmjs/core`);
const ui = nkm.ui;
const uilib = nkm.uilib;

const RemoteDataBlock = require(`../data/remote-data-block`);
const SIGNAL = require(`../signal`);

const _flag_dlc = 'dlc';

class GameCard extends uilib.cards.Media {
    constructor() { super(); }

    static __default_headerPlacement = ui.FLAGS.TOP;
    static __usePaintCallback = true;

    _Init() {
        super._Init();
        //this._orientation.Set(ui.FLAGS.VERTICAL);
        //this._mediaPlacement.Set(ui.FLAGS.TOP);
        this._flags.Add(this, _flag_dlc);
        this._mediaLoaded = false;

        this._Bind(this._OnThumbLoadSuccess);
        this._Bind(this._OnThumbLoadError);
        
        this._delayedInfosUpdate = new nkm.com.time.DelayedCall(this._Bind(this._UpdateInfos));

    }

    _Style() {
        return nkm.style.Extends({
            ':host': {
                'cursor': 'pointer',
                'opacity': 0,
                'transition': 'opacity 0.5s',
                'width': '140px',
                'max-width': '180px',
                '--header-size': '225px'
            },
            ':host(.dlc) .header::before': {
                'position': 'absolute',
                'width': '100%',
                'height': '30px',
                'background-color': 'rgba(255,255,255,0.5)',
                'content': '"DLC"',
                'text-align': 'center',
                'padding-top': '10px',
                'color': 'black'
            }
        }, super._Style());
    }

    _Render() {
        super._Render();
        this.media = nkm.style.URLImgs(`placeholder-dark.png`);
    }

    _OnPaintChange() {
        
        super._OnPaintChange();
        if (this._isPainted) {
            this.style.opacity = 1;
            this._UpdateInfos();
        } else {
            this.style.opacity = 0;
        }
    }

    _OnDataChanged(p_oldData) {
        this._mediaLoaded = false;
        this.media = nkm.style.URLImgs(`placeholder-dark.png`); 
        super._OnDataChanged(p_oldData);

        if(p_oldData){
            p_oldData.Unwatch(SIGNAL.INFOS_UPDATED, this._OnDataUpdated, this);
        }

        if(this._data){
            this._data.Watch(SIGNAL.INFOS_UPDATED, this._OnDataUpdated, this);
        }

    }

    _OnDataUpdated(p_data) {

        super._OnDataUpdated(p_data);
        this.visible = this._ShouldShow(p_data);
        this._delayedInfosUpdate.Schedule();
    }

    _UpdateInfos() {

        if(!this._isPainted){ return; }

        let data = this._data;

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

        this._flags.Set(_flag_dlc, data._parentGame ? true : false);
        this._UpdateMedia();

        this.order = data.order;

        return true;

    }

    _ShouldShow(p_data){ 
        return p_data.state == RemoteDataBlock.STATE_READY
        && p_data.activeUserCount > 0 
        && p_data.passFilters 
        && p_data.passOverlap; 
    }

    _UpdateMedia() {

        if (this._mediaLoaded) { return; }
        if (!this._isPainted || !this._data) { return; }
        if (this._data.state != RemoteDataBlock.STATE_READY) { return; }

        this._mediaLoaded = true;

        "#if WEB";
        if (!nkm.env.isExtension && !nkm.env.isNodeEnabled) {
            this.media = (this._data._logo || nkm.style.URLImgs(`placeholder-dark.png`));
        }
        "#endif";
        
        "#if EXT";
        nkm.io.Read(this._data.logo,
            { cl: nkm.io.resources.BlobResource },
            {
                success: this._OnThumbLoadSuccess,
                error: this._OnThumbLoadError,
                parallel: true
                
            });
        "#endif";
    }

    _OnThumbLoadSuccess(p_rsc) {
        this.media = p_rsc.objectURL;
    }

    _OnThumbLoadError(p_rsc) {
        this.media = nkm.style.URLImgs(`placeholder-dark.png`);
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

    _Cleanup() {
        this.media = nkm.style.URLImgs(`placeholder-dark.png`);
        this._mediaLoaded = false;
        super._Cleanup();
    }

}

module.exports = GameCard;
ui.Register(`sgf-gamecard`, GameCard);