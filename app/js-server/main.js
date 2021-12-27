const server = require(`@nkmjs/core/server`);
const handlers = require(`./handlers`);
class ServerProcess extends server.core.ServerBase {
    constructor(p_config) { super(p_config); }

    _Init() {

        super._Init();

        this._RegisterAPIs({
            getUserProfile: {
                route: `/user/profile/:id`,
                handler: handlers.UserProfile,
                start: true
            },
            getUserProfile64: {
                route: `/user/profile64/:id`,
                handler: handlers.UserProfile64,
                start: true
            },
            getFriendlist: {
                route: `/user/friendlist/:id`,
                handler: handlers.UserFriendlist,
                start: true
            },
            getLibrary: {
                route: `/user/library/:id`,
                handler: handlers.UserLibrary,
                start: true
            },
            getStore: {
                route: `/store/:id`,
                handler: handlers.Store,
                start: true
            },
            getDeal: {
                route: `/deal/:id`,
                handler: handlers.Deal,
                start: true
            }
        });

    }

}

module.exports = ServerProcess;