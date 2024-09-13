import Discord from "discord.js";
import tools from "../../../utils/tools";
import teamMgr from "../../../firebase/teamMgr";
import crew from "../../../utils/crew";
import multiPages from "../../../utils/multiPages";
import { CmdType } from "../../../utils/types";
 

export = {
    name: 'crewraid',
    aliases: ["raid", "ri"],
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
      
                const totalScoreCount: Dict<number> = {};
                const fullScoreCount: Dict<number[]> = {};
                const loseScoreCount: Dict<number[]> = {};

                if (raidInfos) {
                    for (const cmid in raidInfos) {
                        const raidInfo = raidInfos[cmid];
                        if (!raidInfo.Score) continue;

                        for (const playKey in raidInfo.Score) {
                            const scoreInfo = raidInfo.Score[playKey];
                            if (scoreInfo.Stage != stage) continue;

                            totalScoreCount[cmid] = totalScoreCount[cmid] || 0;
                            totalScoreCount[cmid] = totalScoreCount[cmid] + 1;

                            if (scoreInfo.Score >= crew.StageScoreTable[stage]) {
                                fullScoreCount[cmid] = fullScoreCount[cmid] || [];
                                fullScoreCount[cmid].push(scoreInfo.Score);
                            } else {
                                loseScoreCount[cmid] = loseScoreCount[cmid] || [];
                                loseScoreCount[cmid].push(scoreInfo.Score);
                            }
                        }
                    }
                }

                const msgBuf: string[] = [];

                for (const cmid in totalScoreCount) {
                    // const totalCount = totalScoreCount[cmid];
                    const fullCount = fullScoreCount[cmid] || [];
                    const loseCount = loseScoreCount[cmid] || [];

                    msgBuf.push(`名稱: \`${raidInfos[cmid].Name}\`, 滿分: \`${fullCount.length}\`, 未滿分: \`[${loseCount.join(",")}]\` - \`${loseCount.length}\``);
                }

                const len = Object.values(totalScoreCount).length;
                const need = Math.floor(Math.log(len) / Math.log(10));

                if (len > 0) {
                    await tools.sendEmbedMultiMessage(msg, msgBuf, `🔎 **副本資訊 (滿分: 大於${crew.StageScoreTable[stage]})**`, 30, (data, i) => {
                        const have = Math.floor(Math.log(i + 1) / Math.log(10));
                        const fill = "0".repeat(need - have);

                        return `\`#${fill}${i + 1}\` | ${data}\n`;
                    });
                } else {
                    await msg.channel.send({ content: '查無資料!' });
                }
            }
        });
    },
} as Executor;