import moment from "../utils/moment";
import db from "./db";
import { AnyBulkWriteOperation, Document } from "mongodb";

class SteamDao {
    private steamDB = db.svr.db("Discord").collection("SteamFree");

    async updateDiscountFreeGame(details: Dict<Steam.AppDetail>, frees: Dict<boolean>) {
        const time = moment().valueOf();
        const tasks: AnyBulkWriteOperation<Document>[] = [];

        for (const appid in details) {
            tasks.push({
                updateOne: {
                    filter: { appid: appid },
                    update: { 
                        $set: { 
                            lastUpdatedTime: time,
                            isFree: frees[appid] || false
                        } 
                    },
                    upsert: true
                }
            });
        }

        try { 
            await this.steamDB.bulkWrite(tasks);
        } finally { }
    }

    async getFreeDetails() {
        try {
            const result: Dict<ZModel.Steam.FreeDetail> = {};
            await this.steamDB.find().forEach((e: ZModel.Steam.FreeDetail) => {
                result[e.appid] = e;
            });
            return result;
        } finally { }
    }
}

export default new SteamDao();