import db from "./db";

export default {
    async getAllInfo(crewId: string): Promise<ZModel.Game.CrewInfo> {
        const ret = {} as ZModel.Game.CrewInfo;

        try {
            const collection = db.svr.db("Discord").collection("CrewInfo");
            const item = (await collection.findOne({
                crewId: crewId
            }, {
                projection: {
                    members: 1,
                    membersRecord: 1
                }
            }) || {}) as ZModel.Game.CrewInfo;

            ret.members = item.members || {};
            ret.membersRecord = item.membersRecord || {};
        } finally {

        }

        return ret;
    },

    async getMembers(crewId: string): Promise<ZModel.Game.CrewInfo> {
        const ret = {} as ZModel.Game.CrewInfo;

        try {
            const collection = db.svr.db("Discord").collection("CrewInfo");
            const item = (await collection.findOne({
                crewId: crewId
            }, {
                projection: {
                    members: 1,
                }
            }) || {}) as ZModel.Game.CrewInfo;

            ret.members = item.members || {};
        } finally {

        }

        return ret;
    },

    async updateMemberJoinRecord(crewId: string, uuid: string,): Promise<ZModel.Game.CrewInfo> {
        const ret = {} as ZModel.Game.CrewInfo;

        try {
            const collection = db.svr.db("Discord").collection("CrewInfo");
            const item = (await collection.findOne({
                crewId: crewId
            }, {
                projection: {
                    membersRecord: 1,
                }
            }) || {}) as ZModel.Game.CrewInfo;

            ret.membersRecord = item.membersRecord || {};
        } finally {

        }

        return ret;
    },

    async getMembersRecord(crewId: string): Promise<ZModel.Game.CrewInfo> {
        const ret = {} as ZModel.Game.CrewInfo;

        try {
            const collection = db.svr.db("Discord").collection("CrewInfo");
            const item = (await collection.findOne({
                crewId: crewId
            }, {
                projection: {
                    membersRecord: 1,
                }
            }) || {}) as ZModel.Game.CrewInfo;

            ret.membersRecord = item.membersRecord || {};
        } finally {

        }

        return ret;
    },

    async changeMemberName(crewId: string, uuid: string, name: string, time: number): Promise<void> {
        try {
            const namePath = `members.${uuid}.name`;
            const namesPath = `membersRecord.${uuid}.names`;
            const nameHistoryPath = `membersRecord.${uuid}.nameHistory`;

            const actions = {
                $set: {
                    [namePath]: name,
                },
                $push: {
                    [namesPath]: name,
                    [nameHistoryPath]: time,
                }
            };

            const collection = db.svr.db("Discord").collection("CrewInfo");
            await collection.updateOne({
                crewId: crewId
            }, actions, { upsert: true });
        } finally { }
    },

    async joinMember(crewId: string, uuid: string, name: string, time: number, isNew: boolean): Promise<void> {
        try {
            const namePath = `members.${uuid}.name`;
            const namesPath = `membersRecord.${uuid}.names`;
            const nameHistoryPath = `membersRecord.${uuid}.nameHistory`;
            const joinHistoryPath = `membersRecord.${uuid}.joinHistory`;

            const actions = {
                $set: {
                    [namePath]: name,
                },
                $push: {}
            };

            if (isNew) {
                actions.$push = {
                    [namesPath]: name,
                    [nameHistoryPath]: time,
                };
            }

            actions.$push[joinHistoryPath] = time;

            const collection = db.svr.db("Discord").collection("CrewInfo");
            await collection.updateOne({
                crewId: crewId
            }, actions, { upsert: true });
        } finally { }
    },

    async leaveMember(crewId: string, uuid: string): Promise<void> {
        try {
            const memberPath = `members.${uuid}`;

            const actions = {
                $unset: {
                    [memberPath]: 1,
                },
            };

            const collection = db.svr.db("Discord").collection("CrewInfo");
            await collection.updateOne({
                crewId: crewId
            }, actions, { upsert: true });
        } finally { }
    },
};