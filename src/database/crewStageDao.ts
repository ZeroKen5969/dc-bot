import db from "./db";
import crew from "../utils/crew";

export default {
    async addTeamRecord(
        uuid: string, 
        stage: number, 
        count: number, 
        team: string, 
        upgrade: string, 
        score: number, 
        time: number): Promise<void> {

        try {
            const collection = db.svr.db("Discord").collection("CrewStageRecord");
            await collection.updateOne({
                uuid: uuid,
                stage: stage,
                count: count
            }, {
                $set: {
                    team: team,
                    upgrade: upgrade,
                    score: score,
                    time: time
                },
            }, { upsert: true });
        } finally {

        }
    },

    async getTopTeam(stage: number, limit: number = 10): Promise<ZModel.Game.CrewRaidStageTopData[]> {
        const maxScore = crew.StageScoreTable[stage];

        return await db.svr.db("Discord").collection("CrewStageRecord").aggregate<ZModel.Game.CrewRaidStageTopData>([{
            $match: {
                stage: stage
            }
        }, {
            $project: {
                _id: null,
                isWin: { $cond: [{ $gte: ['$score', maxScore] }, 1, 0] },
                isLost: { $cond: [{ $lt: ['$score', maxScore] }, 1, 0] },
                team: "$team",
                time: { $cond: [{ $gte: ['$score', maxScore] }, "$time", 0] },
                score: { $cond: [{ $gte: ['$score', maxScore] }, "$score", 0] }
            }
        }, {
            $group: {
                _id: "$team",
                win: { $sum: "$isWin" },
                lost: { $sum: "$isLost" },
                used: { $count: {} },
                time: { $sum: "$time" },
                score: { $sum: "$score" },
                tops: { $max: "$score" },
            }
        }, {
            $project: {
                _id: 0,
                win: 1,
                lost: 1,
                used: 1,
                team: "$_id",
                rate: { $divide: ["$win", "$used"] },
                avgt: { $divide: ["$time", "$win"] },
                avgs: { $divide: ["$score", "$win"] },
                tops: 1,
            }
        }, {
            $match: {
                win: { $gt: 0 } // 該隊伍至少贏過才列入計算
            }
        }]).sort({ used: -1 }).limit(limit).toArray();
    },

    async clearRecords(): Promise<void> {
        try {
            const collection = db.svr.db("Discord").collection("CrewStageRecord");
            await collection.deleteMany({});
        } finally { }
    },
};