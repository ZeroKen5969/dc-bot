const app = {
    apiKey: "",
    projectId: "",
    appId: "",
};

export default {
    app,

    index: Object.assign({}, app, {
        databaseURL: ""
    }),

    battle: Object.assign({}, app, {
        databaseURL: ""
    }),

    rank: Object.assign({}, app, {
        databaseURL: ""
    }),

    daily: Object.assign({}, app, {
        databaseURL: ""
    }),

    login: Object.assign({}, app, {
        databaseURL: ""
    }),

    room: Object.assign({}, app, {
        databaseURL: ""
    }),

    team: Object.assign({}, app, {
        databaseURL: ""
    }),

    teamMember: Object.assign({}, app, {
        databaseURL: ""
    }),

    teamPrivate: Object.assign({}, app, {
        databaseURL: ""
    }),

    teamHistory: Object.assign({}, app, {
        databaseURL: ""
    }),

    channelRank: Object.assign({}, app, {
        databaseURL: ""
    }),

    common: Object.assign({}, app, {
        databaseURL: ""
    }),

    gamelog: Object.assign({}, app, {
        databaseURL: ""
    }),

    user: (path: string) => Object.assign({}, app, {
        databaseURL: ``
    })
};