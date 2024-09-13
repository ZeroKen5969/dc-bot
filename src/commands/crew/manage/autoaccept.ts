import Discord from "discord.js";
import tools from "../../../utils/tools";
import crew from "../../../utils/crew";
import multiPages from "../../../utils/multiPages";
import anyCrewDao from "../../../database/anyCrewDao";
import { CmdType } from "../../../utils/types";
 

export = {
    name: 'autoaccept',
    aliases: ["autoacpt"],
    description: '開關自動收人',
    permissions: ["ManageGuild"],
    roles: [],
    type: [CmdType.Crew],

    async execute(client: ZClient, msg: Discord.Message, args: string[]) {
        const acptStatus = await anyCrewDao.getAllAutoAcceptStatus();

        const pages = tools.createEmbedMultiMessage(msg, crew.crewids, "🔎 團隊清單", 10, (crewid: string, idx: number) => {
            const crewname = crew.crewidnames[crewid];
            return `${++idx}. \`${crewname} 狀態: ${acptStatus[crewid] || false}\`\n\n`;
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

                await anyCrewDao.updateAutoAcceptStatus(crewid, !acptStatus[crewid]);

                await msg.channel.send({ content: `[${crew.crewidnames[crewid]}] 自動收人狀態已更改為 ${!acptStatus[crewid]}` });
            }
        });
    },
} as Executor;