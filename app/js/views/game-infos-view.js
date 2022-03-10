/*const nkm = require(`@nkmjs/core`);*/
const io = nkm.io;
const u = nkm.utils;
const ui = nkm.ui;
const uilib = nkm.uilib;

const comps = require(`../components`);
const SearchData = require(`../data/search-data`);

const _flag_showPricing = `show-pricing`;

class GameInfosView extends uilib.overlays.Drawer {
    constructor() { super(); }

    _Init() {
        super._Init();

        this._Bind(this._OnStoreRequestSuccess);
        this._Bind(this._OnStoreRequestError);
        this._Bind(this._OnStoreRequestComplete);

        this._Bind(this._OnDealRequestSuccess);
        this._Bind(this._OnDealRequestError);
        this._Bind(this._OnDealRequestComplete);

        this._flags.Add(this, _flag_showPricing);

    }

    _Style() {
        return nkm.style.Extends({
            ':host': {
                'width': '350px',
                //'width':'66%',
                'background-color': 'rgba(61,61,61,0.5)',
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
                '--size': '100%'
            },
            '.pricing': {
                'display': 'none'
            },
            ':host(.show-pricing) .pricing': {
                'display': 'flex',
                'flex-flow':'column nowrap'
            },
            '.boxitem':{
                'flex':'1 1 auto',
                'margin-bottom':'10px'
            },
            '.price': {
                'text-align': 'center',
                'font-size': '5em',
                'margin-bottom':'50px'
            },
            '.discount': {
                'text-align': 'center',
                'color': 'var(--col-ready)'
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


        this._pricingBox = ui.dom.El(`div`, { class: `pricing` }, this._body);

        this._discount = new ui.manipulators.Text(ui.dom.El(`div`, { class: `discount title font-large boxitem` }, this._pricingBox));
        this._price = new ui.manipulators.Text(ui.dom.El(`div`, { class: `price title font-xlarge boxitem` }, this._pricingBox));

        this._openInSteam = this.Add(uilib.buttons.Button, `open-in-steam boxitem`, this._body);
        this._openInSteam.options = {
            label:`Open store page in Steam`, flavor:ui.FLAGS.CTA,
            trigger:{fn:()=>{ window.open(`steam://store/${this._appid}`); }}
        };

        this._openInBrowser = this.Add(uilib.buttons.Button, `open-in-steam boxitem`, this._body);
        this._openInBrowser.options = {
            label:`Open store page in Browser`, variant:ui.FLAGS.FRAME,
            trigger:{fn:()=>{ window.open(`https://store.steampowered.com/app/${this._appid}`, '_blank'); }}
        };

        //this._input = this.Add(comps.UserInputField, `input-field`, this._body);
    }

    _OnDataChanged(p_oldData) {

        super._OnDataChanged(p_oldData);

        
        this._flags.Set(_flag_showPricing, false);

        if (!this._data) { return; }

        this._discount.Set(null);
        this._price.Set(null);

        let appData = this._data.GetOption(`app`, null);
        
        if (!appData) { return; }

        this._appid = appData.appid;

        this._infoCard.visible = true;
        this._infoCard.icon = `refresh`;
        this._infoCard.flavor = nkm.com.FLAGS.LOADING;
        this._infoCard.title = `Loading...`;
        this._infoCard.subtitle = `Loading steam infos, please be patient.`;
        this._infoCard._frame.icon.element.classList.add(`rotating-fast`);

        io.Read(
            nkm.env.APP._GetURLStore(appData.appid),
            { cl: io.resources.TextResource },
            {
                success: this._OnStoreRequestSuccess,
                error: this._OnStoreRequestError,
                any: this._OnStoreRequestComplete,
                important: true,
                parallel: true
            }
        );
    }

    _OnStoreRequestSuccess(p_rsc) {
        console.log(`_OnStoreRequestSuccess`, p_rsc);

        // Retrieve price data
        try {

            let str = p_rsc.content,
                discountAmnt = null,
                price = null;

            // Check discount
            if (str.includes(`class="discount_pct"`)) {
                discountAmnt = str.split(`class="discount_pct">`)[1].split(`</div>`)[0].trim();
                price = str.split(`class="discount_final_price">`)[1].split(`</div>`)[0].trim();
            } else {
                price = str.split(`data-price-final="`)[1].split(`">`)[1].split(`</div>`)[0].trim();
            }

            this._price.Set(`${price}`);
            this._discount.Set(discountAmnt);

            this._flags.Set(_flag_showPricing, true);
            this._infoCard.visible = false;

        } catch (e) {
            console.log(p_rsc.content);
            this._OnStoreRequestError(e);
        }

    }

    _OnStoreRequestError(p_rsc) {

        this._infoCard.visible = true;
        this._infoCard.icon = `error`;
        this._infoCard.flavor = nkm.com.FLAGS.ERROR;
        this._infoCard.title = `ERROR`;
        this._infoCard.subtitle = `Could not retrieve price data.`;
        this._infoCard._frame.icon.element.classList.remove(`rotating-fast`);
        //console.error(`_OnStoreRequestError`, p_rsc);
    }

    _OnStoreRequestComplete(p_rsc) {
        //console.log(`_OnStoreRequestComplete`);
        // TODO : Implement IsThereAnyDeal result

        

        let
            appData = this._data.GetOption(`app`, null),
            url = `https://steam-game-finder-server.glitch.me/deal/${appData.appid}`,
            IPInfos = nkm.env.APP._IPInfos;

        if (IPInfos) {
            url += `?country=${IPInfos.countryCode}`;
        }

        //this._infoCard.subtitle = `Loading IsThereAnyDeal infos, please be patient.`;
        /*
                io.Read(
                    url,
                    { cl: io.resources.JSONResource },
                    {
                        success: this._OnDealRequestSuccess,
                        error: this._OnDealRequestError,
                        any: this._OnDealRequestComplete,
                        important: true,
                        parallel: this._loadParallel
                    }
                );
        */
    }

    _OnDealRequestSuccess(p_rsc) {

    }

    _OnDealRequestError(p_rsc) {

    }

    _OnDealRequestComplete(p_rsc) {
        this._infoCard.visible = false;
    }

    _CleanUp() {
        super._CleanUp();
    }

}

module.exports = GameInfosView;
ui.Register(`sgf-game-infos`, GameInfosView);