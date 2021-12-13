'use strict';

const nkm = require(`@nkmjs/core`);
const u = nkm.utils;
const collections = nkm.collections;

const GameData = require("./game-data");
const UserData = require("./user-data");

const RemoteDataBlock = require(`./remote-data-block`);

const SIGNAL = require(`./signal`);

class Database extends nkm.common.pool.DisposableObjectEx{

    constructor() { super(); }

    _Init(){
        super._Init();

        this._gameMap = new collections.Dictionary();
        this._gameList = new Array();

        this._flagMap = new collections.Dictionary();
        this._userMap = new collections.Dictionary();
        this._currentOverlap = new Array();
        this._filteredCount = 0;

        this._userStatuses = RemoteDataBlock.STATE_NONE;

        this._Bind(this._UpdateInfos);
        this._Bind(this._LoadStoredFilterList);

        this._enums = [];
    //    this._enums.push({ key:"21", id:`dlc`, flag:false }); // 0
    //    this._enums.push({ key:"1", id:`multiplayer`, flag:true }); // 1
    //    this._enums.push({ key:"2", id:`single_player`, flag:false }); // 2
    //    this._enums.push({ key:"49", id:`pvp`, flag:true }); // 3
    //    this._enums.push({ key:"9", id:`coop`, flag:true }); // 4
        this._enums.push({ key:"20", id:`MMO`, flag:false }); // 5
        this._enums.push({ key:"36", id:`Online PvP`, flag:true }); // 6
        this._enums.push({ key:"38", id:`Online Coop`, flag:true }); // 7
        this._enums.push({ key:"47", id:`LAN PvP`, flag:false }); // 8
        this._enums.push({ key:"48", id:`LAN Coop`, flag:false }); // 9
        this._enums.push({ key:"37", id:`Split screen PvP`, flag:false }); // 10
        this._enums.push({ key:"39", id:`Split screen Coop`, flag:false }); // 11
    //    this._enums.push({ key:"27", id:`cross_platform_mp`, flag:false }); // 12
    //    this._enums.push({ key:"29", id:`trading_cards`, flag:false }); // 13
    //    this._enums.push({ key:"35", id:`in_app_purchase`, flag:false }); // 14
    //    this._enums.push({ key:"18", id:`partial_controller_support`, flag:false }); // 15
    //    this._enums.push({ key:"28", id:`full_controller_support`, flag:false }); // 16
    //    this._enums.push({ key:"22", id:`achievements`, flag:false }); // 17
    //    this._enums.push({ key:"22", id:`steam_cloud`, flag:false }); // 18
    //    this._enums.push({ key:"13", id:`captions`, flag:false }); // 19
    //    this._enums.push({ key:"42", id:`remote_play_tablet`, flag:false }); // 20
    //    this._enums.push({ key:"43", id:`remote_play_tv`, flag:false }); // 21
        this._enums.push({ key:"44", id:`Remote play together`, flag:false }); // 22
    //    this._enums.push({ key:"30", id:`steam_workshop`, flag:false }); // 23
    //    this._enums.push({ key:"32", id:`steam_turn_notification`, flag:false }); // 24

        this._filters = new Array();

        try{chrome.storage.sync.get(['filterlist'], this._LoadStoredFilterList);}catch(e){this._UpdateFilters();}
        
    }

    _LoadStoredFilterList(result){
        
        try{
            if(result.filterlist != ``){
                let list = result.filterlist.split(`,`);
                let en;
                for(let i = 0, n = this._enums.length; i < n; i++){
                    en = this._enums[i];
                    en.flag = list.includes(en.key);
                }
            }
        }catch(e){}

        this._UpdateFilters();

    }

    ////

    GetGame( p_appid ){

        let game = null;
        if(this._gameMap.Contains(p_appid)){
            game = this._gameMap.Get(p_appid);
        }else{
            game = new GameData();
            game.appid = p_appid;
            game.Watch(RemoteDataBlock.STATE_CHANGE, this._OnGameStateChanged, this);
            game.Watch(nkm.common.SIGNAL.UPDATED, this._OnGameUpdated, this);
            this._gameMap.Set(p_appid, game);
            this._gameList.push(game);
            this._Broadcast(SIGNAL.GAME_ADDED, game);
            //game.RequestLoad();
        }

        return game;
    }

    _OnGameUpdated(p_game){
        this._Broadcast(SIGNAL.GAME_UPDATED, p_game);
        nkm.common.time.NEXT_TICK = this._UpdateInfos;
    }

    _OnGameStateChanged(p_game, p_state){
        if(p_state == RemoteDataBlock.STATE_READY){
            this._Broadcast(SIGNAL.GAME_READY, p_game);
        }
    }

    /////

    GetUser( p_username, p_active = true ){

        let user = null;
        if(this._userMap.Contains(p_username)){
            user = this._userMap.Get(p_username);
        }else{
            user = new UserData();
            user.Watch(nkm.common.SIGNAL.RELEASED, this._OnUserReleased, this);
            user._db = this;
            user.userid = p_username;  
            user.active = p_active;          
            this._userMap.Set(p_username, user);
            this._Broadcast(SIGNAL.USER_ADDED, user);
            user.Watch(nkm.common.SIGNAL.UPDATED, this._OnUserUpdate, this);
            user.RequestLoad();
        }

        return user;

    }

    _OnUserReleased(p_user){
        this._userMap.Remove(p_user.userid);
        this._Broadcast(SIGNAL.USER_REMOVED, p_user);
        this._OnUserUpdate(p_user);
    }

    _OnUserUpdate(p_user){
        
        

        let anyLoading = false;
        let invalidCount = 0;
        let readyCount = 0;

        let uList = this._userMap.keys;
        let user;
        for(let i = 0, n = uList.length; i < n; i++){
            user = this._userMap.Get(uList[i]);

            if(user.state == RemoteDataBlock.STATE_NONE
                || user.state == RemoteDataBlock.STATE_LOADING){
                anyLoading = true;
            }else if(user.state == RemoteDataBlock.STATE_INVALID){
                invalidCount ++;
            }else if(user.state == RemoteDataBlock.STATE_READY){
                readyCount ++;
            }

        }

        let diff = uList.length - invalidCount;

        if(diff == 0){
            this._userStatuses = RemoteDataBlock.STATE_INVALID;
        }else if(anyLoading){
            this._userStatuses = RemoteDataBlock.STATE_LOADING;
        }else{
            this._ComputeOverlap();
            this._userStatuses = RemoteDataBlock.STATE_READY;
        }

        this._Broadcast(SIGNAL.USER_UPDATED, p_user);

        if(!nkm.env.isNodeEnabled){
            let uList = this._GetUserJSONData(uList);
            try{ chrome.storage.sync.set({userlist:uList} );}catch(e){}
        }        

        //if(uList.length == 0){ this._ComputeOverlap(); }
        this._ComputeOverlap();

        nkm.common.time.NEXT_TICK = this._UpdateInfos;

    }

    _GetUserJSONData(p_keys = null){

        if(!p_keys){ p_keys = this._userMap.keys; }

        let user;
        let data = [];
        for(let i = 0, n = p_keys.length; i < n; i++){
            user = this._userMap.Get(p_keys[i]);
            if(user.profileID64 == ``){continue;}
            data.push({ id:user.profileID64, active:user.active });
        }

        return JSON.stringify(data);
    }

    _ComputeOverlap(){


        this._currentOverlap.length = 0;

        let userKeys = this._userMap.keys;
        let userList = new Array();
        let user;
        let refUser;

        //Find user with the fewest games, yet not 0
        for(let i = 0, n = userKeys.length; i < n; i++){

            user = this._userMap.Get(userKeys[i]);
            if(user.gamesCount == 0 || !user.active){ continue; }

            userList.push(user);

            if(!refUser || (refUser && (user.gamesCount < refUser.gamesCount))){
                refUser = user;
            }

        }

        if(!refUser || userList.length < 1){ 
            //console.warn(`refUser = ${refUser} / userList.length = ${userList.length} / uKey.length = ${userKeys.length}`);
            nkm.common.time.NEXT_TICK = this._UpdateInfos;
            return; 
        }

        let gameList = refUser._gameList.keys;
        
        for(let g = 0, n = gameList.length; g < n; g++){
            
            let game = this._gameMap.Get(gameList[g]);
            let ok = true;

            for(let i = 0, ni = userList.length; i < ni; i++ ){
                if(!game._users.includes(userList[i])){ ok = false; }
            }

            if(ok){ this._currentOverlap.push(game); }

        }

        nkm.common.time.NEXT_TICK = this._UpdateInfos;

    }

    _UpdateFilters(){

        this._filters.length = 0;
        let fl = ``;
        let en;
        for(let i = 0, n = this._enums.length; i < n; i++){
            en = this._enums[i];
            if(en.flag){ 
                this._filters.push(en.key); 
                fl += `${i!=0?',':''}${en.key}`; 
            }
        }

        try{ chrome.storage.sync.set({filterlist:fl} );}catch(e){}

        this._Broadcast(SIGNAL.FILTERS_UPDATED, this);
        nkm.common.time.NEXT_TICK = this._UpdateInfos;

    }

    _UpdateInfos(){

        // Update game infos, when available
        if(this._currentOverlap.length == 0){
            //Either no game, or no overlap yet.
            this._filteredCount = 0;
            this._Broadcast(SIGNAL.INFOS_UPDATED, this);
            return;
        }

        // Reset all games to shouldShow = false;
        for(let g = 0, n = this._gameList.length; g < n; g++){
            this._gameList[g].shouldShow = false;
        }

        this._filteredCount = 0;

        // Flag overlapped games that meet filter criterias
        let game;
        for(let g = 0, n = this._currentOverlap.length; g < n; g++){
            game = this._currentOverlap[g];
            let hasFlags = game.HasFlags(this._filters);
            game.shouldShow = hasFlags;
            if(hasFlags){ this._filteredCount++; }
        }

        this._Broadcast(SIGNAL.INFOS_UPDATED, this);
    }

    _CleanUp(){
        super._CleanUp();
    }

}

module.exports = Database;