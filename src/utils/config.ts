export default {
    task: {
        weekreward: [{
            gid: "gid00",
            cid: "cid11"
        }],

        autosendcrystal: [{
            gid: "gid00",
            cid: "cid22"
        }, {
            gid: "gid33",
            cid: "cid33"
        }],

        autonrdunaccept: [{
            gid: "gid00",
            cid: "cid44"
        }],

        autoaccept: [{
            gid: "gid00",
            cid: "cid22"
        }, {
            gid: "gid33",
            cid: "cid33"
        }],

        autobanuser: [{
            gid: "gid00",
            cid: "cid22"
        }, {
            gid: "gid33",
            cid: "cid33"
        }],

        drugnotify: {
            uid: "uid00"
        },

        crewlistener: {
            rid: "rid00",
        },

        crewraidchecker: {
            meow: "rid11",
            badMeow: "rid11"
        },

        crewchecker: {
            all: ["rid00", "rid22", "rid33"],

            specDiffRole: { // 在此列表的身分組將直接移除
                "rid33": [ // 非團員
                    "rid44", 
                ]
            },

            unJoin: [
                "rid00", // 團員
                "rid22" // 未入團
            ],

            other: [
                "rid33" // 非團員
            ],

            self: [
                "rid00" // 團員
            ]
        },

        steamfreegame: [{
            gid: "gid11",
            cid: "cid44"
        }],
    },

    command: {
        noregister: {
            rid: "rid00",
        },
        confirm: {
            rid: "rid00",
            errlog: [{
                gid: "gid00",
                cid: "cid55"
            }],
            welcome: [{
                gid: "gid00",
                cid: "cid66"
            }],
        }
    },

    event: {
        chatClientChatMessages: {
            ["crewid11"]: {
                gid: "gid00",
                cid: "cid77"
            }, 
            ["040"]: {
                gid: "gid00",
                cid: "cid88"
            }
        },

        crewMemberJoin: [{
            gid: "gid00",
            cid: "cid99"
        }, {
            gid: "gid33",
            cid: "cidaa"
        }],

        crewMemberLeave: [{
            gid: "gid00",
            cid: "cid99"
        }, {
            gid: "gid33",
            cid: "cidaa"
        }],

        crewMemberNameChange: [{
            gid: "gid00",
            cid: "cid99"
        }, {
            gid: "gid33",
            cid: "cidaa"
        }],

        eggsAppear: {
            reply: [{
                uid: "uid00",
                text: "找我嗎",
            }, {
                uid: "uid22",
                text: "安靜",
            }],
            delete: {
                "uid22": [
                    "訊息已被刪除",
                    "訊息不可見",
                ]
            }
        },
    },

    ccInfo: {
        from: "uidzz",
        to: "uid00",
        title: "0000000",
        text: [
            "1111111111",
            "2222222222",
            "3333333333"
        ],
        date: "2024-09-13",
        fonts: {
            "Great Vibes": "GreatVibes-Regular.ttf",
            "beauty": "the beauty.ttf"
        },
        background: "card.jpg"
    },
};
