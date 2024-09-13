import db from "./db";
import { UpdateResult } from "mongodb";

export default {
    async getBlackInfo(): Promise<ZModel.Discord.BlackList> {
        const ret = {} as ZModel.Discord.BlackList;

        try {
            const collection = db.svr.db("Discord").collection("BlackList");
            const item = (await collection.findOne(null, { projection: { blackList: 1 } }) || {}) as ZModel.Discord.BlackList;

            ret.blackList = item.blackList || {};
        } finally {

        }

        return ret;
    },

    async addBlackId(id: string): Promise<void> {
        try {
            const path = `blackList.${id}`;

            const collection = db.svr.db("Discord").collection("BlackList");
            await collection.updateOne({}, {
                $set: {
                    [path]: true
                }
            }, { upsert: true });
        } finally { }
    },

    async removeBlackId(id: string): Promise<UpdateResult> {
        try {
            const path = `blackList.${id}`;

            const collection = db.svr.db("Discord").collection("BlackList");
            const result = await collection.updateOne({}, {
                $unset: {
                    [path]: false
                }
            }, { upsert: true });

            return result;
        } finally { }
    },
};