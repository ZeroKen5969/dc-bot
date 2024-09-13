import db from "./db";
import { AnyBulkWriteOperation } from "mongodb";

export default {
    cookieDB: db.svr.db("Discord").collection<ZModel.Genshin.CookieData>("GenshinCookie"),
    accountDB: db.svr.db("Discord").collection<ZModel.Genshin.AccountData>("GenshinAccount"),

    async setCookie(dcId: string, cookie: string, uids: string[]) {
        try {
            const tasks: AnyBulkWriteOperation<ZModel.Genshin.AccountData>[] = [];
            for (const uid of uids) {
                tasks.push({
                    updateOne: {
                        filter: { userId: dcId, uid: uid },
                        update: {
                            $set: {}
                        },
                        upsert: true
                    }
                });
            }

            await this.cookieDB.updateOne({
                userId: dcId,
            }, {
                $set: {
                    cookie: cookie,
                    uids: uids,
                }
            }, { upsert: true });

            await this.accountDB.bulkWrite(tasks);
        } finally { }
    },

    async getCookie(dcId: string): Promise<ZModel.Genshin.CookieData> {
        const ret = {} as ZModel.Genshin.CookieData;

        try {
            const item = (await this.cookieDB.findOne({
                userId: dcId,
            }, {
                projection: {
                    cookie: 1,
                    uids: 1,
                }
            }) || {}) as ZModel.Genshin.CookieData;

            ret.uids = item.uids || [];
        } finally {

        }

        return ret;
    },

    async getAllStoreCookie(): Promise<ZModel.Genshin.CookieData[]> {
        const ret: ZModel.Genshin.CookieData[] = [];

        try {
            await this.cookieDB.find({}, {}).forEach((item) => {
                item.uids = item.uids || [];
                ret.push(item);
            });
        } finally {

        }

        return ret;
    },

    async getSignStatus(dcId: string): Promise<ZModel.Genshin.AccountData> {
        const ret = {} as ZModel.Genshin.AccountData;

        try {
            const item = (await this.accountDB.findOne({
                userId: dcId,
            }, {}) || {}) as ZModel.Genshin.AccountData;

            ret.hoyolabLastSign = item.hoyolabLastSign || 0;
            ret.genshinLastSign = item.genshinLastSign || 0;
        } finally {

        }

        return ret;
    },

    async updateSignTime(dcId: string, hoyolabSignTime?: number, genshinSignTime?: number): Promise<ZModel.Genshin.AccountData[]> {
        const ret = {} as ZModel.Genshin.AccountData[];
        const info: { hoyolabLastSign?: number; genshinLastSign?: number; } = {};

        if (hoyolabSignTime != undefined) {
            info.hoyolabLastSign = hoyolabSignTime;
        }
        if (genshinSignTime != undefined) {
            info.genshinLastSign = genshinSignTime;
        }

        try {
            await this.accountDB.updateOne({
                userId: dcId,
            }, {
                $set: info
            }, { upsert: true });
        } finally {

        }

        return ret;
    },
};