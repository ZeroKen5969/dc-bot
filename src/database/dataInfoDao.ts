import db from "./db";

export default {
    async updateDrugNotifyFlag(drugFlag: boolean): Promise<void> {
        try {
            const collection = db.svr.db("Discord").collection("DataInfo");
            await collection.updateOne({}, {
                $set: { drugFlag: drugFlag }
            }, { upsert: true });
        } finally { }
    },

    async updateDrugNotifyTime(drugTime: number): Promise<void> {
        try {
            const collection = db.svr.db("Discord").collection("DataInfo");
            await collection.updateOne({}, {
                $set: { drugTime: drugTime }
            }, { upsert: true });
        } finally { }
    },

    async updateDrugNotifyDays(days: number): Promise<void> {
        try {
            const collection = db.svr.db("Discord").collection("DataInfo");
            await collection.updateOne({}, {
                $set: { drugDays: days }
            }, { upsert: true });
        } finally { }
    },

    async findDrugNotify(): Promise<ZModel.Discord.DataInfo> {
        const ret = {} as ZModel.Discord.DataInfo;

        try {
            const collection = db.svr.db("Discord").collection("DataInfo");
            const item = (await collection.findOne(null, { projection: { drugTime: 1, drugFlag: 1, drugDays: 1 } }) || {}) as ZModel.Discord.DataInfo;

            ret.drugDays = item.drugDays || 0;
            ret.drugTime = item.drugTime || 0;
            ret.drugFlag = item.drugFlag || false;
        } finally {

        }

        return ret;
    },

    async findRankRewardDate(): Promise<ZModel.Discord.DataInfo> {
        const ret = {} as ZModel.Discord.DataInfo;

        try {
            const collection = db.svr.db("Discord").collection("DataInfo");
            const item = (await collection.findOne(null, { projection: { lastRewardTime: 1 } }) || {}) as ZModel.Discord.DataInfo;

            ret.lastRewardTime = item.lastRewardTime || 0;
        } finally {

        }

        return ret;
    },

    async findCrewRewardDate(): Promise<ZModel.Discord.DataInfo> {
        const ret = {} as ZModel.Discord.DataInfo;

        try {
            const collection = db.svr.db("Discord").collection("DataInfo");
            const item = (await collection.findOne(null, { projection: { lastCrewRewardTime: 1 } }) || {}) as ZModel.Discord.DataInfo;

            ret.lastCrewRewardTime = item.lastCrewRewardTime || 0;
        } finally {

        }

        return ret;
    },

    async findAnyCrewRewardDate(): Promise<ZModel.Discord.DataInfo> {
        const ret = {} as ZModel.Discord.DataInfo;

        try {
            const collection = db.svr.db("Discord").collection("DataInfo");
            const item = (await collection.findOne(null, { projection: { lastAnyCrewRewardTime: 1 } }) || {}) as ZModel.Discord.DataInfo;

            ret.lastAnyCrewRewardTime = item.lastAnyCrewRewardTime || 0;
        } finally {

        }

        return ret;
    },

    async loadCrystalNum(): Promise<ZModel.Game.CrystalSettingsCollection> {
        let ret: ZModel.Game.CrystalSettingsCollection = null;

        try {
            const collection = db.svr.db("Discord").collection("DataInfo");
            const item = (await collection.findOne(null, { projection: { crewCrystal: 1 } }) || {}) as ZModel.Discord.DataInfo;

            ret = item.crewCrystal || {} as ZModel.Game.CrystalSettingsCollection;
        } finally { }

        return ret;
    },

    async update(data: any): Promise<void> {
        try {
            const collection = db.svr.db("Discord").collection("DataInfo");
            await collection.updateOne({}, {
                $set: data
            }, { upsert: true });
        } finally { }
    },

    async findAll(): Promise<Dict<ZModel.Discord.DataInfo>> {
        const ret = {};

        try {
            const collection = db.svr.db("Discord").collection("DataInfo");
            const datas = collection.find();
            await datas.forEach((item: ZModel.Discord.DataInfo) => {
                const tmp = {} as ZModel.Discord.DataInfo;

                tmp.lastRewardTime = item.lastRewardTime || 0;

                ret[item._id.toString()] = tmp;
            });

        } finally { }

        return ret;
    },

    async removeAll(): Promise<ZModel.Discord.DataInfo> {
        const ret = {} as ZModel.Discord.DataInfo;

        try {
            const collection = db.svr.db("Discord").collection("DataInfo");
            await collection.deleteMany({});
        } finally { }

        return ret;
    },
};