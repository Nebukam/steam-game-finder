const nkm = require(`@nkmjs/core`);
const ui = nkm.ui;
const uilib = nkm.uilib;

const base = uilib.cards.Icon;

class InfoCard extends base {
    constructor() { super(); }

    static __usePaintCallback = true;

    _Init() {
        super._Init();
        nkm.env.APP.filters.Watch(nkm.com.SIGNAL.UPDATED, this._OnFiltersUpdated, this);
    }

    static _Style() {
        return nkm.style.Extends({
            ':host': {
                //'backdrop-filter':'blur(10px)',
                //'background-color':'rgba(0,0,0,0.5)'
            }
        }, base._Style());
    }

    _Render() {
        super._Render();
        this.label = '<i>Certain things such as films, apps, and other outlier products are omitted.</i>';
        this.actions = [
            {
                cl: uilib.buttons.Button,
                label: 'Open filters', variant: ui.FLAGS.FRAME,
                trigger: { fn: () => { nkm.env.APP.mainLayout.shelf.RequestView(1); } }
            },
            {
                cl: uilib.buttons.Button,
                label: 'Open user list', variant: ui.FLAGS.FRAME,
                trigger: { fn: () => { nkm.env.APP.mainLayout.shelf.RequestView(0); } }
            }];
    }

    _OnPaintChange() {
        super._OnPaintChange();

        if (this._isPainted) {
            this.style.opacity = 1;
        } else {
            this.style.opacity = 0;
        }
    }

    _OnFiltersUpdated() {

        let
            filters = nkm.env.APP.filters,
            database = nkm.env.APP.database;

        let
            title = `Shared games`,
            subtitle = `That's the shared games amongst the currently registered users`,
            icon = `visible`,
            variant = null,
            flavor = null;

        if (database._userReadyList.count == 0) {

            title = "Shared games !";
            subtitle = "This is where they will show once you get some libraries loaded.";
            variant = ui.FLAGS.FRAME;
            flavor = ui.FLAGS.CTA;
            icon = `dots`;

        } else {

            if (filters._overlapCount == 0) {

                title = `No shared games amongst active users`;
                subtitle = `There is currently no shared games between active users.`;
                variant = ui.FLAGS.FRAME;
                flavor = nkm.com.FLAGS.ERROR;
                icon = `hidden`;

            } else {
                if (filters._activeCount == 0) {

                    title = `No results`;
                    subtitle = `Despite ${filters._overlapCount} games, the current filters produce no results.<br>Please check filters.`;
                    variant = ui.FLAGS.FRAME;
                    flavor = nkm.com.FLAGS.ERROR;
                    icon = `hidden`;

                } else {

                    title = `${filters._activeCount} Matches`;
                    subtitle = `Out of ${filters._overlapCount} games, ${filters._activeCount} match your active filters.`;
                    variant = ui.FLAGS.FRAME;
                    flavor = ui.FLAGS.CTA;
                    icon = `visible`;

                }
            }
        }

        this.title = title;
        this.subtitle = subtitle;
        this.variant = variant;
        this.flavor = flavor;
        this.icon = icon;

    }

    _UpdateCardNoUsers() {
        this.title = "Shared games !";
        this.subtitle = "This is where they will show once you get some libraries loaded.";
        this.variant = ui.FLAGS.FRAME;
        this.flavor = ui.FLAGS.CTA;
        this.icon = `dots`;
    }

    _UpdateCardNoOverlap() {
        this.title = "Oops";
        this.subtitle = "The current settings (active users & active filters) produces no overlap.";
        this.variant = ui.FLAGS.FRAME;
        this.flavor = nkm.com.FLAGS.ERROR;
        this.icon = `hidden`;
    }

    _UpdateCardShowAll() {
        this.title = `That's ${nkm.env.APP.filters._filteredCount} games.`;
        this.subtitle = "Currently showing the games of everyone.";
        this.variant = ui.FLAGS.FRAME;
        this.flavor = ui.FLAGS.CTA;
        this.icon = `view-grid`;
    }

    _UpdateCardsRegular() {
        this.title = `That's ${nkm.env.APP.filters._filteredCount} games.`;
        this.subtitle = "Currently showing the result of active users + active filters";
        this.variant = ui.FLAGS.FRAME;
        this.flavor = null;// ui.FLAGS.CTA;
        this.icon = `visible`;
    }

}

module.exports = InfoCard;
ui.Register(`sgf-infocard`, InfoCard);