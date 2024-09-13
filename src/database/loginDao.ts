import db from "./db";

export default {
    async find(id): Promise<ZModel.Discord.LoginData> {
        const ret = {} as ZModel.Discord.LoginData;

        try {
            const collection = db.svr.db("Discord").collection("LoginData");
            const item = (await collection.findOne({
                userId: id,
            }) || {}) as ZModel.Discord.LoginData;

            ret.userId = item.userId || id;
            ret.image = item.image || "";
            ret.isLogin = item.isLogin || false;
        } finally {

        }

        return ret;
    },

    async update(acc): Promise<void> {
        try {
            const collection = db.svr.db("Discord").collection("LoginData");
            await collection.updateOne({
                userId: acc.userId,
            }, {
                $set: acc
            }, { upsert: true });
        } finally { }
    },

    async findAll(): Promise<Dict<ZModel.Discord.LoginData>> {
        const ret = {};

        try {
            const collection = db.svr.db("Discord").collection("LoginData");
            const datas = collection.find();
            await datas.forEach((item: ZModel.Discord.LoginData) => {
                const tmp = {} as ZModel.Discord.LoginData;

                tmp.userId = item.userId;
                tmp.image = item.image || "";
                tmp.isLogin = item.isLogin || false;

                ret[tmp.userId] = tmp;
            });

        } finally { }

        return ret;
    },

    async findAllLoginInfo(): Promise<Dict<ZModel.Discord.LoginData>> {
        const ret = {};

        try {
            const collection = db.svr.db("Discord").collection("LoginData");
            const datas = collection.find(null, { projection: { userId: 1, isLogin: 1 } });
            await datas.forEach((item: ZModel.Discord.LoginData) => {
                const tmp = {} as ZModel.Discord.LoginData;

                tmp.userId = item.userId;
                tmp.image = item.image || "";
                tmp.isLogin = item.isLogin || false;

                ret[tmp.userId] = tmp;
            });

        } finally { }

        return ret;
    },

    async removeAll(): Promise<void> {
        try {
            const collection = db.svr.db("Discord").collection("LoginData");
            await collection.deleteMany({});
        } finally { }
    }
};