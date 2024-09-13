import Discord from "discord.js";
import tools from "../../../utils/tools";
import teamMgr from "../../../firebase/teamMgr";
import crew from "../../../utils/crew";
import multiPages from "../../../utils/multiPages";
import { CmdType } from "../../../utils/types";
 

export = {
    name: 'teaminfo',
    aliases: ['ti'],
    description: '查詢團隊訊息',
    permissions: ["ManageGuild"],
    roles: [],
    users: [],
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

                const team = await teamMgr.getTeam(crewid);
                const SubscribeList = await teamMgr.getSubscribeListInfo(crewid);

                const msgBuf = [
                    `名稱: ${team.Name}`,
                    `顯示人數: ${team.Num}`,
                    `實際人數: ${Object.keys(SubscribeList).length}`,
                    `經驗: ${team.Exp}`,
                    `代碼: ${team.Tag}`,
                    `狀態: ${team.IsOpen ? "公開" : "非公開"}`,
                ];

                await tools.sendEmbedMultiMessage(msg, msgBuf, "**團隊資訊**", 30, (data) => {
                    return `${data}\n\n`;
                });
            }
        });
    },
} as Executor;