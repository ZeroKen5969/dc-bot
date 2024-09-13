import db from "./db";

export default {
    async find(id): Promise<ZModel.Discord.AccountData> {
        const ret = {} as ZModel.Discord.AccountData;

        try {
            const collection = db.svr.db("Discord").collection("AccountData");
            const item = (await collection.findOne({
                userId: id,
            }) || {}) as ZModel.Discord.AccountData;

            ret.userId = item.userId || id;
            ret.score = item.score || 0;
            ret.weekScore = item.weekScore || 0;
            ret.rank = item.rank || 0;
            ret.status = item.status || 0;
            ret.adminPerm = item.adminPerm || false;

        } finally {

        }

        return ret;
    },

    async update(acc): Promise<void> {
        try {
            const collection = db.svr.db("Discord").collection("AccountData");
            await collection.updateOne({
                userId: acc.userId,
            }, [{
                $set: acc
            }], { upsert: true });
        } finally { }
    },

    async setAdminPerm(uuid: string, flag: boolean): Promise<void> {
        try {
            const collection = db.svr.db("Discord").collection("AccountData");
            await collection.updateOne({
                userId: uuid,
            }, [{
                $set: {
                    adminPerm: flag
                }
            }], { upsert: true });
        } finally { }
    },

    async getAdminPerm(uuid: string): Promise<boolean> {
        let ret = false;

        try {
            const collection = db.svr.db("Discord").collection("AccountData");
            const item = (await collection.findOne({
                userId: uuid,
            }, { projection: { adminPerm: 1 } }) || {}) as ZModel.Discord.AccountData;
            
            ret = item.adminPerm || false;
        } finally { }

        return ret;
    },

    async findAll(): Promise<ZModel.Discord.AccountData[]> {
        const ret = [];

        try {
            const collection = db.svr.db("Discord").collection("AccountData");
            const datas = collection.find();
            await datas.forEach((item: ZModel.Discord.AccountData) => {
                const tmp = {} as ZModel.Discord.AccountData;

                tmp.userId = item.userId;
                tmp.score = item.score || 0;
                tmp.weekScore = item.weekScore || 0;
                tmp.rank = item.rank || 0;
                tmp.status = item.status || 0;

                ret.push(tmp);
            });

        } finally { }

        return ret;
    },

    async updateAll(option): Promise<void> {
        try {
            const collection = db.svr.db("Discord").collection("AccountData");
            await collection.updateMany({}, [{
                $set: option
            }]);
        } finally { }
    },

    async removeAll(): Promise<void> {
        try {
            const collection = db.svr.db("Discord").collection("AccountData");
            await collection.deleteMany({});
        } finally { }
    },


    async clearWeekScore(): Promise<void> {
        try {
            const collection = db.svr.db("Discord").collection("AccountData");
            await collection.updateMany({}, [{
                $set: { weekScore: 0 }
            }]);
        } finally { }
    },

    async findAllWeekScore(): Promise<ZModel.Discord.AccountData[]> {
        const ret = [];

        try {
            const collection = db.svr.db("Discord").collection("AccountData");

            const datas = collection.find(null, {
                projection: { userId: 1, weekScore: 1 }
            });

            await datas.forEach((item: ZModel.Discord.AccountData) => {
                const tmp = {} as ZModel.Discord.AccountData;

                tmp.userId = item.userId;
                tmp.weekScore = item.weekScore || 0;

                ret.push(tmp);
            });

        } finally { }

        return ret;
    },

    async bindChatUser(dcId: string, gameUserId: string): Promise<void> {
        try {
            const collection = db.svr.db("Discord").collection("AccountData");

            await collection.updateOne({
                userId: dcId,
            }, [{
                $set: {
                    gameUserId: gameUserId
                }
            }], { upsert: true });
        } finally { }
    },

    async findChatUser(dcId: string): Promise<string> {
        let ret: string = null;

        try {
            const collection = db.svr.db("Discord").collection("AccountData");

            const data = await collection.findOne<ZModel.Discord.AccountData>({
                userId: dcId,
            }, {
                projection: { gameUserId: 1 }
            });

            ret = data && data.gameUserId;
        } finally { }

        return ret;
    }
};