import Discord from "discord.js";
import moment from "../../../utils/moment";
import tools from "../../../utils/tools";
import teamMgr from "../../../firebase/teamMgr";
import crew from "../../../utils/crew";
import multiPages from "../../../utils/multiPages";
import { CmdType } from "../../../utils/types";
 

export = {
    name: 'nocrewraid',
    aliases: ["noraid", "nori"],
    description: '團隊副本無記錄者查詢',
    permissions: ["ManageGuild"],
    roles: [],
    type: [CmdType.Crew],

    async execute(client: ZClient, msg: Discord.Message, args: string[]) {
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
                const subscribeList = await teamMgr.getSubscribeListInfo(crewid);

                const msgBuf: string[] = [];

                for (const cmid in subscribeList) {
                    const crew_member = subscribeList[cmid];
                    if (!raidInfos || !raidInfos[cmid] || !raidInfos[cmid].Score || !Object.values(raidInfos[cmid].Score).length) {
                        const last = moment.tz(crew_member.LoginDate, 'MM/DD/YYYY hh:mm:ss a', 'Asia/Seoul');
                        const curr = moment().utcOffset(9);
                        const dateFmt = tools.timeFormat(curr.diff(last), true);

                        msgBuf.push(`名稱: \`${crew_member.Name}\`, 等級: \`${crew_member.Level + 1}\` ID: \`${cmid}\` 最後上線: \`${dateFmt}\``);
                    }
                }

                const len = msgBuf.length;
                const need = Math.floor(Math.log(len) / Math.log(10));

                if (len > 0) {
                    await tools.sendEmbedMultiMessage(msg, msgBuf, `🔎 **未打副本**`, 30, (data, i) => {
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