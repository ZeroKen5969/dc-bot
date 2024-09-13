import db from "./db";

export default {
    async find(id: string): Promise<ZModel.Discord.BindData> {
        const ret = {} as ZModel.Discord.BindData;

        try {
            const collection = db.svr.db("Discord").collection("BindData");
            const item = (await collection.findOne({
                userId: id,
            }) || {}) as ZModel.Discord.BindData;

            ret.userId = item.userId || id;
            ret.accounts = item.accounts || [];
        } finally {

        }

        return ret;
    },

    async update(acc: ZModel.Discord.BindData): Promise<void> {
        try {
            const collection = db.svr.db("Discord").collection("BindData");
            await collection.updateOne({
                userId: acc.userId,
            }, {
                $set: {
                    accounts: acc.accounts,
                }
            }, { upsert: true });
        } finally { }
    },

    async findAll(): Promise<ZModel.Discord.BindDataCollection> {
        const ret = {};

        try {
            const collection = db.svr.db("Discord").collection("BindData");
            const datas = collection.find();
            await datas.forEach((item: ZModel.Discord.BindData) => {
                const tmp = {} as ZModel.Discord.BindData;

                tmp.userId = item.userId;
                tmp.accounts = item.accounts || [];

                ret[tmp.userId] = tmp;
            });

        } finally { }

        return ret;
    },
};