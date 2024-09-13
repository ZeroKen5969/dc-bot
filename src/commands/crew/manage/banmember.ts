import Discord from "discord.js";
import moment from "../../../utils/moment";
import tools from "../../../utils/tools";
import multiPages from "../../../utils/multiPages";
import teamMgr from "../../../firebase/teamMgr";
import crew from "../../../utils/crew";
import { CmdType } from "../../../utils/types";
 

export = {
    name: 'banmember',
    aliases: ["bm"],
    description: '封鎖團隊成員',
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
            const SubscribeList = await teamMgr.getSubscribeListInfo(crewid);

            for (const info in SubscribeList) {
                const crew_member = SubscribeList[info];
                const crew_member_name = crew_member.Name.toLowerCase();

                if (gameName) {
                    if (crew_member_name.includes(gameName) || gameName.includes(crew_member_name)) {
                        may.push({ crewid: crewid, id: info, data: crew_member });
                    }
                } else {
                    may.push({ crewid: crewid, id: info, data: crew_member });
                }
            }
        }

        if (may.length > 0) {
            const title = `🔎 團隊成員`;

            const pages = tools.createEmbedMultiMessage(msg, may, title, 10, (data: Game.MemberFullInfo, idx: number) => {
                const last = moment.tz(data.data.LoginDate, 'MM/DD/YYYY hh:mm:ss a', 'Asia/Seoul');
                const curr = moment().utcOffset(9);
                const dateFmt = tools.timeFormat(curr.diff(last), true);

                const fakeId = data.id.substring(0, data.id.length / 2);
                const crewname = crew.crewidnames[data.crewid];

                return `${++idx}. \`${crewname}\` | 名稱: \`${data.data.Name}\` 等級: \`${data.data.Level + 1}\` ID: \`${fakeId}\` 最後上線: \`${dateFmt}\`\n\n`;
            });

            let allIndex: number[] = [];
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

                        const result = await teamMgr.banMember(crewid, gameId);

                        if (result == null) {
                            msgBuf.push(`\`${crewname}\` | 玩家\`${may[index - 1].data.Name} (${gameId})\`不在團隊名單!`);
                        } else {
                            msgBuf.push(`\`${crewname}\` | 玩家\`${may[index - 1].data.Name} (${gameId})\`已被剔除 & 封鎖!`);
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