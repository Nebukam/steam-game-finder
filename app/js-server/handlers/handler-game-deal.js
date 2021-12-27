'use strict';

const HandlerUserBase = require(`./base-user-handler`);

class HandlerGameDeal extends HandlerUserBase {
    constructor() { super(); }

    _Init() {
        super._Init();
        this._Bind(this._OnPlainSuccess);
        this._Bind(this._OnPlainError);
    }

    _SanitizeRequest(p_request) {

        if (super._SanitizeRequest(p_request)) {
            // Try to get country code
            this._countryCode = null;
            if (p_request.query.country) { this._countryCode = p_request.query.country; }
            return true;
        }

        return false;
    }

    Handle() {

        // Get PLAIN Id
        let url = `https://api.isthereanydeal.com/v02/game/plain/?key=${process.env.ANYDEAL_API_KEY}&shop=steam&game_id=app%${this._id}`;

        axios
            .get(url)
            .then(this._OnPlainSuccess)
            .catch(this._OnPlainError);

    }

    _OnPlainSuccess(p_plainRes) {
        // fetch & return actual data
        let data = p_plainRes.data,
        plain = null;

        if(data){
            if(data.data){
                if(data.data.plain){
                    plain = data.data.plain;
                }
            }
        }

        if(!plain){ 
            this._OnPlainError(new Error(`no plain`)); 
            return;
        }

        let url = `https://api.isthereanydeal.com/v01/game/prices/?key=${process.env.ANYDEAL_API_KEY}&shops=steam`;
        if (this._countryCode) { url += `&country=${this._countryCode}`; }

        this.Fetch(url);
    }

    _OnPlainError(p_err) {
        this._OnFetchError(p_err);
    }

}

module.exports = HandlerGameDeal;