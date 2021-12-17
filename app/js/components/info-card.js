const nkm = require(`@nkmjs/core`);
const ui = nkm.ui;
const uilib = nkm.uilib;

const SIGNAL = require(`../data/signal`);

class InfoCard extends uilib.cards.Icon {
    constructor() { super(); }

    static __usePaintCallback = true;

    _Init() {
        super._Init();
        nkm.env.APP.database.Watch(SIGNAL.INFOS_UPDATED, this._OnInfosUpdated, this);
    }

    _Style() {
        return nkm.style.Extends({
            ':host': {
                //'backdrop-filter':'blur(10px)',
                //'background-color':'rgba(0,0,0,0.5)'
            }
        }, super._Style());
    }

    _Render() {
        super._Render();
        this.label = '<i>Certain things such as films, apps, and other outlier products are omitted.</i>';
        this.actions = [{
            cl:uilib.buttons.Button,
            label:'Open filters', flavor:nkm.com.FLAGS.ERROR,
            trigger: { fn:()=>{nkm.env.APP.mainLayout.shelf.RequestView(1);} }
        }];
    }

    _OnPaintChange() {
        super._OnPaintChange();

        if(this._isPainted){
            this.style.opacity = 1;
        }else{
            this.style.opacity = 0;
        }
    }

    _OnInfosUpdated(){
        
        let DB = nkm.env.APP.database;

        /// Update card info based on situation
        if(DB._filterShowAll.flag){
            this._UpdateCardShowAll();
        }else if(DB._userReadyList.count == 0){
            this._UpdateCardNoUsers();
        }else if(DB._filteredCount == 0){
            this._UpdateCardNoOverlap();
        }else{
            this._UpdateCardsRegular();
        }
        
    }

    _UpdateCardNoUsers(){
        this.title = "Shared games !";
        this.subtitle ="This is where they will show once you get some libraries loaded.";
        this.variant = ui.FLAGS.FRAME;
        this.flavor = ui.FLAGS.CTA;
        this.icon = `dots`;
        this._toolbar.visible = true;
    }

    _UpdateCardNoOverlap(){
        this.title = "Oops";
        this.subtitle ="The current settings (active users & active filters) produces no overlap.";
        this.variant = ui.FLAGS.FRAME;
        this.flavor = nkm.com.FLAGS.ERROR;
        this.icon = `hidden`;
        this._toolbar.visible = true;
    }

    _UpdateCardShowAll(){
        this.title = `That's ${nkm.env.APP.database._filteredCount} games.`;
        this.subtitle ="Currently showing the games of everyone.";
        this.variant = ui.FLAGS.FRAME;
        this.flavor = ui.FLAGS.CTA;
        this.icon = `view-grid`;
        this._toolbar.visible = false;
    }

    _UpdateCardsRegular(){
        this.title = `That's ${nkm.env.APP.database._filteredCount} games.`;
        this.subtitle ="Currently showing the result of active users + active filters";
        this.variant = ui.FLAGS.FRAME;
        this.flavor = null;// ui.FLAGS.CTA;
        this.icon = `visible`;
        this._toolbar.visible = false;
    }

}

module.exports = InfoCard;
ui.Register(`sgf-infocard`, InfoCard);