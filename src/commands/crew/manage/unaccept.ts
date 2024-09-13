import Discord from "discord.js";
import tools from "../../../utils/tools";
import crew from "../../../utils/crew";
import multiPages from "../../../utils/multiPages";
import blackListDao from "../../../database/blackListDao";
import teamMgr from "../../../firebase/teamMgr";
import { CmdType } from "../../../utils/types";
 

export = {
    name: 'unaccept',
    aliases: ["unacpt"],
    description: '獲取申請中玩家並拒絕申請',
    permissions: ["ManageGuild"],
    roles: [],
    type: [CmdType.Crew],

    async execute(client: ZClient, msg: Discord.Message, args: string[]) {
        const may: Game.MemberFullInfo[] = [];

        for (const crewid of crew.crewids) {
            const SignUpList = await teamMgr.getSignInfo(crewid);

            for (const info in SignUpList) {
                const signup_member = SignUpList[info];
                may.push({ crewid: crewid, id: info, data: signup_member });
            }
        }

        if (may.length > 0) {
            const title = `🔎 申請中成員`;

            const pages = tools.createEmbedMultiMessage(msg, may, title, 10, (data: Game.MemberFullInfo, idx: number) => {
                const fakeId = data.id.substring(0, data.id.length / 2);
                const crewname = crew.crewidnames[data.crewid];

                return `${++idx}. \`${crewname}\` | 名稱: \`${data.data.Name}\` 等級: \`${data.data.Level + 1}\` ID: \`${fakeId}\`\n\n`;
            });

            let allIndex = [];
            await multiPages.sendInputMultiPages(msg, pages, 60000, null, {
                max: 1,
                filter(m) {
                    if (m.author.id != msg.author.id) return false;

                    allIndex = [];

                    if (m.content.toLowerCase() == "all") {
                        may.forEach((_, i) => allIndex.push(i + 1));
                        return true;
                    }

                    const contents = m.content.trim().split(/\s+/);

                    for (let i = 0; i < contents.length; ++i) {
                        const index = parseInt(contents[i]);

                        if (!isNaN(index) && index <= may.length && index > 0) {
                            allIndex.push(index);
                        }
                    }
                    if (allIndex.length < 1) return false;

                    return true;
                },
                async end(collected) {
                    msg = collected.first();

                    const msgBuf = [];

                    const blackInfo = await blackListDao.getBlackInfo();

                    const actions = [];

                    for (let i = 0; i < allIndex.length; ++i) {
                        const index = allIndex[i] - 1;
                        const gameId = may[index].id;
                        const crewid = may[index].crewid;

                        if (blackInfo.blackList[gameId]) {
                            actions.push(teamMgr.acceptSign(crewid, gameId, 2));
                        } else {
                            actions.push(teamMgr.acceptSign(crewid, gameId, 2));
                        }
                    }

                    const results = await Promise.allSettled(actions);

                    for (let i = 0; i < results.length; ++i) {
                        const v = results[i];

                        if (v.status == "fulfilled") {
                            const index = allIndex[i] - 1;
                            const gameId = may[index].id;
                            const crewid = may[index].crewid;
                            const crewname = crew.crewidnames[crewid];

                            const result = v.value;

                            if (blackInfo.blackList[gameId]) {
                                msgBuf.push(`\`${crewname}\` | 已拒絕玩家\`${may[index].data.Name} (${gameId})\`申請! (玩家在黑名單之中)`);
                            } else {
                                if (result == null) {
                                    msgBuf.push(`\`${crewname}\` | 玩家\`${may[index].data.Name} (${gameId})\`已取消申請!`);
                                } else if (result == 1) {
                                    msgBuf.push(`\`${crewname}\` | 已接受玩家\`${may[index].data.Name} (${gameId})\`申請!`);
                                } else if (result == 2) {
                                    msgBuf.push(`\`${crewname}\` | 已拒絕玩家\`${may[index].data.Name} (${gameId})\`申請!`);
                                } else {
                                    msgBuf.push(`\`${crewname}\` | 未處理玩家\`${may[index].data.Name} (${gameId})\`申請!`);
                                }
                            }
                        }
                    }

                    await tools.sendMultiMessage(msg, msgBuf, "", 30, (data: string) => {
                        return `${data}\n`;
                    });
                }
            });
        } else {
            await msg.channel.send({ content: `查無資料!` });
        }
    },
} as Executor;