'use strict';
/*const nkm = require(`@nkmjs/core`);*/
const u = nkm.utils;
const io = nkm.io;

//const axios = require(`axios`);

const SIGNAL = require(`../signal`);

class RemoteDataBlock extends nkm.data.DataBlock{

    static STATE_NONE = 'state-none';
    static STATE_LOADING = 'state-loading';
    static STATE_READY = 'state-ready';
    static STATE_INVALID = 'state-invalid';

    constructor() { super(); }

    _Init(){
        super._Init();

        this._loadPriority = false;
        this._loadParallel = true;
        this._mode = `cors`;
        this._rscType = io.resources.TextResource;

        this._db = null;
        this._state = RemoteDataBlock.STATE_NONE;
        this._dataPath = "";

        this._Bind(this._OnLoadRequestSuccess);
        this._Bind(this._OnLoadRequestError);        
        this._Bind(this._OnLoadRequestComplete);

    }

    get state(){ return this._state; }
    set state(p_state){
        if(p_state == this._state){return;}
        let oldState = this._state;
        this._state = p_state;        
        this._Broadcast(SIGNAL.STATE_CHANGED, this, p_state, oldState);
        this.CommitUpdate();
    }

    get isReady(){
        return this._state == RemoteDataBlock.STATE_READY;
    }

    RequestLoad(b_force = false){

        if(!b_force && this._state != RemoteDataBlock.STATE_NONE){
            return;
        }

        this.state = RemoteDataBlock.STATE_LOADING;
        io.Read(
            this._dataPath,
            { cl: this._rscType },
            {
                success: this._OnLoadRequestSuccess,
                error: this._OnLoadRequestError,
                any:this._OnLoadRequestComplete,
                important:this._loadPriority, 
                parallel:this._loadParallel,
                mode:this._mode
            }
        );
        
    }

    _OnLoadRequestSuccess(p_rsc){
        this.state = RemoteDataBlock.STATE_READY;
    }

    _OnLoadRequestError(p_err){

        //console.error(p_err);
        if(p_err.response && p_err.response.status == 429){
            nkm.env.APP._429();
        }
        this.state = RemoteDataBlock.STATE_INVALID;
    }

    _OnLoadRequestComplete(){
        
    }

    _CleanUp(){

        this._state = RemoteDataBlock.STATE_NONE;
        this._dataPath = "";

        super._CleanUp();
    }

}

module.exports = RemoteDataBlock;