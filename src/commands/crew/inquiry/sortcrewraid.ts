import Discord from "discord.js";
import moment from "../../../utils/moment";
import tools from "../../../utils/tools";
import teamMgr from "../../../firebase/teamMgr";
import crew from "../../../utils/crew";
import multiPages from "../../../utils/multiPages";
import { CmdType } from "../../../utils/types";

export = {
    name: 'sortcrewraid',
    aliases: ["sortraid", "sri"],
    description: '團隊副本成員記錄查詢',
    permissions: ["ManageGuild"],
    roles: [],
    type: [CmdType.Crew],

    async execute(client: ZClient, msg: Discord.Message, args: string[]) {
        if (args.length < 1) {
            await msg.channel.send({ content: '需給予副本難度!' });
            return;
        }

        let stage = parseInt(args[0]);

        if (isNaN(stage) || stage < 1 || stage > 5) {
            await msg.channel.send({ content: '副本難度區間為1~5!' });
            return;
        }

        --stage;

        const pages = tools.createEmbedMultiMessage(msg, crew.crewids, "🔎 團隊清單", 10, (crewid: string, idx: number) => {
            const crewname = crew.crewidnames[crewid];
            return `${++idx}. \`${crewname}\`\n\n`;
        });

        await multiPages.sendInputMultiPages(msg, pages, 60000, null, {
            max: 1,
            filter(m) {
                if (m.author.id != msg.author.id) return false;
                if (!m.content.match(/^\d+$/)) return false;

                const index = parseInt(m.content);
                if (isNaN(index)) return false;
                if (index > crew.crewids.length || index <= 0) return false;

                return true;
            },
            async end(collected) {
                msg = collected.first();

                const index = parseInt(msg.content);
                const crewid = crew.crewids[index - 1];

                const raidInfos = await teamMgr.getCrewRaidInfo(crewid);

                const stagePlayers: Game.CombineRaidScore[] = [];

                if (raidInfos) {
                    for (const cmid in raidInfos) {
                        const raidInfo = raidInfos[cmid];
                        if (!raidInfo.Score) continue;

                        for (const playKey in raidInfo.Score) {
                            const scoreInfo = raidInfo.Score[playKey];
                            if (scoreInfo.Stage != stage) continue;

                            stagePlayers.push({
                                PID: cmid, ...scoreInfo,
                            })
                        }
                    }
                }

                stagePlayers.sort((x, y) => {
                    if (x.Score == y.Score) {
                        const time1 = moment.tz(x.Time, 'MM/DD/YYYY hh:mm:ss a', 'Asia/Seoul').valueOf();
                        const time2 = moment.tz(y.Time, 'MM/DD/YYYY hh:mm:ss a', 'Asia/Seoul').valueOf();
                        return time1 - time2; // 時間越小越前面
                    } else {
                        return y.Score - x.Score; // 分數越大越前面
                    }
                });
                const msgBuf: string[] = [];

                for (const player of stagePlayers) {
                    const localPlayTime = moment.tz(player.Time, 'MM/DD/YYYY hh:mm:ss a', 'Asia/Seoul').utcOffset(8).format('MM/DD/YYYY HH:mm:ss');
                    console.log(player.Time, localPlayTime);
                    msgBuf.push(`名稱: \`${raidInfos[player.PID].Name}\`, 難度: \`${player.Stage + 1}\`, 分數: \`${player.Score}\`, 完成時間: \`${localPlayTime}\``);
                }

                const need = Math.floor(Math.log(stagePlayers.length) / Math.log(10));

                if (stagePlayers.length > 0) {
                    const recordPages = tools.createEmbedMultiMessage(msg, msgBuf, `🔎 **副本排行**`, 15, (data, i) => {
                        const have = Math.floor(Math.log(i + 1) / Math.log(10));
                        const fill = "0".repeat(need - have);

                        return `\`#${fill}${i + 1}\` | ${data}\n\n`;
                    });
                    await multiPages.sendMultiPages(msg, recordPages, 60000);
                } else {
                    await msg.channel.send({ content: '查無資料!' });
                }
            }
        });
    },
} as Executor;