const nkm = require(`@nkmjs/core`);
const u = nkm.utils;
const ui = nkm.ui;
const uilib = nkm.uilib;

const comps = require(`../components`);
const FriendData = require(`../data/friend-data`);

class FriendsListView extends uilib.overlays.Drawer {
    constructor() { super(); }

    _Init() {
        super._Init();
        this._Bind(this._OnFriendlistLoadSuccess);
        this._Bind(this._OnFriendlistLoadError);
        this._friendlist = new Array();
    }

    _Style() {
        return nkm.style.Extends({
            ':host': {
                'min-width': '350px',
                'width':'66%',
                'background-color':'rgba(61,61,61,0.5)',
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
                '--size':'100%'                
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
    }

    _OnDataChanged(p_oldData) {
        super._OnDataChanged(p_oldData);
        this._ClearFriendlist();
        if (!this._data) { return; }

        let userData = this._data.GetOption(`user`, null);

        if (!userData) { return; }

        this._SetInfosLoading();
        // Load user' friendlist
        nkm.io.Read(
            nkm.env.APP._GetURLFriendlist(userData.profileID64),
            { cl: nkm.io.resources.TextResource },
            {
                success: this._OnFriendlistLoadSuccess,
                error: this._OnFriendlistLoadError
            });
    }


    _OnFriendlistLoadSuccess(p_rsc) {

        let friendSplit = p_rsc.content.split(`<div class="selectable friend_block_`);

        if (friendSplit.length == 0) {
            // No friends or private friendlist
            return;
        }

        for (var i = 0, n = friendSplit.length; i < n; i++) {
            let friendserial = friendSplit[i];
            try {

                let profileID64 = friendserial.split(`data-steamid="`)[1].split(`"`)[0];
                let profileAvatar = friendserial.split(`<div class="player_avatar`)[1].split(`<img src="`)[1].split(`"`)[0];
                let profileName = friendserial.split(`<div class="friend_block_content`)[1].split(`>`)[1].split(`<`)[0];

                let friend = new FriendData();
                friend._profileID64 = profileID64;
                friend._personaID = profileName;
                friend._avatarURL = profileAvatar;
                friend.existingUser = nkm.env.APP.database.FindUser(profileID64);
                
                let card = this.Add(comps.FriendCard, `user-card`, this._cardCtnr);
                card.data = friend;

                this._friendlist.push(card);


            } catch (e) {
                //console.error(e);
            }
        }

        if (this._friendlist.length == 0) {
            this._SetInfosError();
        } else {
            this._SetInfosNone();
        }

    }

    _OnFriendlistLoadError(p_err) {
        if (p_err.response && p_err.response.status == 429) { ENV.APP._429(); }
        //this._statusLabel.text = `<font color="#ffce00">Either no friends or private friendlist</font>`;
    }

    _SetInfosLoading(){
        this._infoCard.visible = true;
        this._infoCard.icon = `search`;
        this._infoCard.title = `Loading`;
        this._infoCard.subtitle = `loading friendlist, please be patient`;
        this._infoCard.flavor = null;// nkm.com.FLAGS.INFOS;
        this._infoCard.variant = ui.FLAGS.MINIMAL;
    }

    _SetInfosError(){
        this._infoCard.visible = true;
        this._infoCard.icon = `error`;
        this._infoCard.title = `Nope !`;
        this._infoCard.subtitle = `Could not retrieve friend infos.`;
        this._infoCard.flavor = nkm.com.FLAGS.ERROR;
        this._infoCard.variant = ui.FLAGS.MINIMAL;
    }

    _SetInfosNone(){
        this._infoCard.visible = false;
    }

    _ClearFriendlist() {
        for (var i = 0; i < this._friendlist.length; i++) {
            this._friendlist[i].Release();
        }
        this._friendlist.length = 0;
    }

    _CleanUp() {
        this._ClearFriendlist();
        super._CleanUp();
    }

}

module.exports = FriendsListView;
ui.Register(`sgf-friendslist`, FriendsListView);