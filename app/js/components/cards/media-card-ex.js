const nkm = require(`@nkmjs/core`);
const ui = nkm.ui;
const uilib = nkm.uilib;

const RemoteDataBlock = require(`../../data/remote-data-block`);
const SIGNAL = require(`../../signal`);

const _flag_dlc = 'dlc';
const domparser = new DOMParser();

class MediaCardEx extends uilib.cards.Media {
    constructor() { super(); }

    static __usePaintCallback = true;

    _Init() {
        super._Init();

        this._mediaPropertyName = `logo`;

        this._mediaLoaded = false;

        this._Bind(this._OnMediaLoadSuccess);
        this._Bind(this._OnMediaLoadError);

        this._delayedInfosUpdate = nkm.com.DelayedCall(this._Bind(this._UpdateInfos));

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

        if (p_oldData) {
            p_oldData.Unwatch(SIGNAL.INFOS_UPDATED, this._OnDataUpdated, this);
        }

        if (this._data) {
            this._data.Watch(SIGNAL.INFOS_UPDATED, this._OnDataUpdated, this);
        }

    }

    _OnDataUpdated(p_data) {

        super._OnDataUpdated(p_data);
        this.visible = this._ShouldShow(p_data);
        this._delayedInfosUpdate.Schedule();

    }

    _UpdateInfos() {

        if (!this._isPainted) { return false; }

        this._UpdateMedia(this._data);

        return true;

    }

    _ShouldShow(p_data) { return true; }

    _ShouldLoadMedia(p_data) { return p_data.state == RemoteDataBlock.STATE_READY; }

    _UpdateMedia(p_data) {

        if (this._mediaLoaded) { return; }
        if (!this._isPainted || !p_data) { return; }
        if (!this._ShouldLoadMedia(p_data)) { return; }

        this._mediaLoaded = true;

        "#if WEB";
        if (!nkm.env.isExtension && !nkm.env.isNodeEnabled) {
            this.mediaDirect = `url(${p_data[this._mediaPropertyName]}), url(${nkm.style.URLImgs(`placeholder-dark.png`)})`;
        }
        "#endif";

        "#if EXT";
        console.log(p_data[this._mediaPropertyName]);
        nkm.io.Read(p_data[this._mediaPropertyName],
            { cl: nkm.io.resources.BlobResource },
            {
                success: (p_rsc) => { this.media = p_rsc.objectURL; },
                error: (e) => { console.log(e); this.media = nkm.style.URLImgs(`placeholder-dark.png`); },
                parallel: true

            });
        "#endif";
    }

    _OnMediaLoadSuccess(p_rsc) {
        this.media = p_rsc.objectURL;
    }

    _OnMediaLoadError(p_rsc) {
        this.media = nkm.style.URLImgs(`placeholder-dark.png`);
    }

    _Cleanup() {
        this.media = nkm.style.URLImgs(`placeholder-dark.png`);
        this._mediaLoaded = false;
        super._Cleanup();
    }

}

module.exports = MediaCardEx;