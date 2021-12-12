const nkm = require(`@nkmjs/core`);
const u = nkm.utils;
const ui = nkm.ui;
const uiworkspace = nkm.uiworkspace;

const MainShelf = require(`./main-shelf`);

class MainLayout extends ui.views.Layer {
    constructor() { super(); }

    _Init() {
        super._Init();
        // Add a file drop handler
        this._dropExt = this._pointer.Add(ui.extensions.Drop);
        this._dropExt.Hook({
            check: { fn: (p_data) => { 
                if(!ui.POINTER.EXTERNAL_DRAG){ return false; }
                console.log(p_data, this); console.log(p_data.items.length); return true; } },
            drop: { fn: (p_data) => { 
                console.log(`drooop`); 

                for(let i = 0; i < p_data.items.length; i++){
                    let item = p_data.items[i];
                    console.log(`Item ${i} = ${item} (${item.kind} / ${item.type} / ${item.path})`);
                    if(item.kind.includes(`string`)){ item.getAsString((s)=>{ console.log(`-> ${s}`); }); }
                }

                for(let i = 0; i < p_data.files.length; i++){
                    let file = p_data.files[i];
                    console.log(`File ${i} = ${file} (${file.kind} / ${file.type} / ${file.path})`);
                }

                console.log(p_data.getData("text/uri-list"));

            } },
            dropCandidate:{ fn:(p_toggle) => { } }
        });
        
    }

    _Style() {
        return nkm.style.Extends({
            ':host': {

            },
            '.header': {
                'height': `var(--${ui.FLAGS.SIZE_L})`
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

        // Workspace
        let wkspace = this.Add(uiworkspace.WorkspaceRoot, `workspace`);
        new ui.manipulators.GridItem(wkspace, 2, 2, 1, 1);
        this.workspace = wkspace;

        this._dropExt.Setup(this);

    }

}

module.exports = MainLayout;
ui.Register(`toolbox-main-layout`, MainLayout);