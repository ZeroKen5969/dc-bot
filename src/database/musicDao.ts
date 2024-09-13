import db from "./db";

export default {
    async loadCacheMusics(guildId: string = null): Promise<ZModel.Music.Cache[]> {
        const ret: ZModel.Music.Cache[] = [];

        try {
            const collection = db.svr.db("Discord").collection("MusicCache");
            const datas = collection.find(guildId ? { guildId: guildId } : {});

            await datas.forEach((item: ZModel.Music.Cache) => {
                const tmp = {} as ZModel.Music.Cache;

                tmp.guildId = item.guildId;
                tmp.voiceChannel = item.voiceChannel;
                tmp.textChannel = item.textChannel;
                tmp.musics = item.musics || [];
                tmp.repeatStatus = item.repeatStatus || "none";

                ret.push(tmp);
            });

        } finally { }

        return ret;
    },

    async addMusicsToQueue<T>(guildId: string, tracks: T[]): Promise<void> {
        try {
            const collection = db.svr.db("Discord").collection("MusicCache");
            await collection.updateOne({
                guildId: guildId,
            }, {
                $push: {
                    musics: { $each: tracks }
                },
            }, { upsert: true });
        } finally { }
    },

    async removeMusicByIndex(guildId: string, index: number): Promise<void> {
        try {
            const path = `musics.${index}`;
            const collection = db.svr.db("Discord").collection("MusicCache");

            await collection.updateOne({
                guildId: guildId,
            }, {
                $unset: {
                    [path]: 1
                }
            });

            await collection.updateOne({
                guildId: guildId,
            }, {
                $pull: {
                    "musics": null
                }
            });
        } finally { }
    },

    async destroyGuildMusics(guildId: string): Promise<void> {
        try {
            const collection = db.svr.db("Discord").collection("MusicCache");

            await collection.deleteOne({
                guildId: guildId,
            });
        } finally { }
    },

    async updateMusicChannel(guildId: string, voiceChannel: string, textChannel: string): Promise<void> {
        try {
            const collection = db.svr.db("Discord").collection("MusicCache");

            await collection.updateOne({
                guildId: guildId,
            }, {
                $set: {
                    voiceChannel: voiceChannel,
                    textChannel: textChannel,
                },
            }, { upsert: true });
        } finally { }
    },

    async clearMusicByRange(guildId: string, min: number, max: number): Promise<void> {
        try {
            const allPath = {};

            for (let i = min; i < max; ++i) {
                const path = `musics.${i}`;
                allPath[path] = 1;
            }

            const collection = db.svr.db("Discord").collection("MusicCache");

            await collection.updateOne({
                guildId: guildId,
            }, {
                $unset: allPath
            });

            await collection.updateOne({
                guildId: guildId,
            }, {
                $pull: {
                    "musics": null
                }
            });
        } finally { }
    },

    async updateLoopStatus(guildId: string, repeatStatus: Music.RepeatStatus): Promise<void> {
        try {
            const collection = db.svr.db("Discord").collection("MusicCache");

            await collection.updateOne({
                guildId: guildId,
            }, {
                $set: {
                    repeatStatus: repeatStatus,
                },
            }, { upsert: true });
        } finally { }
    },
};