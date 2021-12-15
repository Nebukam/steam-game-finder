const nkm = require(`@nkmjs/core`);
const u = nkm.utils;
const ui = nkm.ui;
const uiworkspace = nkm.uiworkspace;
const sgfViews = require(`./views`);

const MainShelf = require(`./main-shelf`);

class MainLayout extends ui.views.Layer {
    constructor() { super(); }

    _Init() {
        super._Init();
    }

    _Style() {
        return nkm.style.Extends({
            ':host': {
                'background':`url("${nkm.style.URLImgs(`bg.png`)}")`
            },
            '.header': {
                'height': `0`//`var(--${ui.FLAGS.SIZE_L})`
            },
            '.shelf': {
            },
            '.workspace': {
            }
        }, super._Style());
    }

    _Render() {

        new ui.manipulators.Grid(this, [`max-content`, 0], [`max-content`, 0]);

        // Header
        let header = u.El(`div`, { class: `header` }, this);
        new ui.manipulators.GridItem(header, 1, 1, 2, 1);
        this.header = header;

        // Side Shelf
        let shelf = this.Add(MainShelf, `shelf`);
        shelf.nav.size = ui.FLAGS.SIZE_L;
        shelf.nav.defaultWidgetOptions = {
            variant: ui.FLAGS.MINIMAL
        };
        new ui.manipulators.GridItem(shelf, 1, 2, 1, 1);
        this.shelf = shelf;
/*
        // Workspace
        let wkspace = this.Add(uiworkspace.WorkspaceRoot, `workspace`);
        new ui.manipulators.GridItem(wkspace, 2, 2, 1, 1);
        this.workspace = wkspace;
        */

        
        

    }

}

module.exports = MainLayout;
ui.Register(`toolbox-main-layout`, MainLayout);