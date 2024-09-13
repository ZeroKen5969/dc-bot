import Discord from "discord.js";
import moment from "../../../utils/moment";
import tools from "../../../utils/tools";
import multiPages from "../../../utils/multiPages";
import teamMgr from "../../../firebase/teamMgr";
import crew from "../../../utils/crew";
import { CmdType } from "../../../utils/types";
 

export = {
    name: 'unbanmember',
    aliases: ["ubm"],
    description: '解除封鎖團隊成員',
    permissions: ["ManageGuild"],
    roles: [],
    type: [CmdType.Crew],

    async execute(client: ZClient, msg: Discord.Message, args: string[]) {
        let gameName = null;

        if (args.length >= 1) {
            gameName = args[0].toLowerCase();
        }

        const may: Game.MemberFullInfo[] = [];

        for (const crewid of crew.crewids) {
            const BlackList = await teamMgr.getBlackInfo(crewid);
            for (const info in BlackList) {
                const black_member = BlackList[info];
                const black_member_name = black_member.Name.toLowerCase();

                if (gameName) {
                    if (black_member_name.includes(gameName) || gameName.includes(black_member_name)) {
                        may.push({ crewid: crewid, id: info, data: black_member });
                    }
                } else {
                    may.push({ crewid: crewid, id: info, data: black_member });
                }
            }
        }

        if (may.length > 0) {
            const title = `🔎 封鎖名單`;

            let counter = 0;
            const pages = tools.createEmbedMultiMessage(msg, may, title, 10, (data: Game.MemberFullInfo) => {
                const last = moment.tz(data.data.LoginDate, 'MM/DD/YYYY hh:mm:ss a', 'Asia/Seoul');
                const curr = moment().utcOffset(9);
                const dateFmt = tools.timeFormat(curr.diff(last), true);

                const fakeId = data.id.substring(0, data.id.length / 2);
                const crewname = crew.crewidnames[data.crewid];
                return `${++counter}. \`${crewname}\` | 名稱: \`${data.data.Name}\` 等級: \`${data.data.Level + 1}\` ID: \`${fakeId}\` 最後上線: \`${dateFmt}\`\n\n`;
            });

            let allIndex = [];
            await multiPages.sendInputMultiPages(msg, pages, 60000, null, {
                max: 1,
                filter(m) {
                    if (m.author.id != msg.author.id) return false;

                    allIndex = [];

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

                    for (let i = 0; i < allIndex.length; ++i) {
                        const index = allIndex[i];
                        const gameId = may[index - 1].id;
                        const crewid = may[index - 1].crewid;
                        const crewname = crew.crewidnames[crewid];

                        const result = await teamMgr.unbanMember(crewid, gameId);

                        if (result == null) {
                            msgBuf.push(`\`${crewname}\` | 玩家\`${may[index - 1].data.Name} (${gameId})\`不在封鎖名單!`);
                        } else {
                            msgBuf.push(`\`${crewname}\` | 玩家\`${may[index - 1].data.Name} (${gameId})\`已解除封鎖!`);
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