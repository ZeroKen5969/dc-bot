import db from "./db";

export default {
    async getAnyCrewInfo(): Promise<ZModel.Game.AnyCrewDatas> {
        let ret: ZModel.Game.AnyCrewDatas = {};

        try {
            const collection = db.svr.db("Discord").collection("AnyCrew");
            const datas = collection.find();
            await datas.forEach((item: ZModel.Game.AnyCrewData) => {
                const tmp = {} as ZModel.Game.AnyCrewData;

                tmp.cwid = item.cwid || "";
                tmp.lastCrewRewardTime = item.lastCrewRewardTime || 0;
                tmp.rewarded = item.rewarded || false;

                ret[tmp.cwid] = tmp;
            });
        } finally {

        }

        return ret;
    },

    async updateAnyCrewReward(cwid: string, rewarded: boolean, rewardTime?: number): Promise<void> {
        try {
            const data: { rewarded: boolean, lastCrewRewardTime?: number } = {
                rewarded: rewarded,
            };

            if (rewarded) {
                data.lastCrewRewardTime = rewardTime;
            }

            const collection = db.svr.db("Discord").collection("AnyCrew");
            await collection.updateOne({
                cwid: cwid
            }, {
                $set: data
            }, { upsert: true });
        } finally { }
    },

    async getAllAutoAcceptStatus(): Promise<Dict<boolean>> {
        let ret: Dict<boolean> = {};

        try {
            const collection = db.svr.db("Discord").collection("AnyCrew");
            await collection.find({}, {
                projection: {
                    cwid: 1,
                    autoaccept: 1,
                }
            }).forEach((item: ZModel.Game.AnyCrewData) => {
                ret[item.cwid] = item.autoaccept || false;
            });
        } finally {

        }

        return ret;
    },

    async updateAutoAcceptStatus(cwid: string, status: boolean): Promise<ZModel.Game.AnyCrewData> {
        const ret = {} as ZModel.Game.AnyCrewData;

        try {
            const collection = db.svr.db("Discord").collection("AnyCrew");
            await collection.updateOne({
                cwid: cwid
            }, {
                $set: {
                    autoaccept: status,
                }
            }, { upsert: true });
        } finally {

        }

        return ret;
    },
};