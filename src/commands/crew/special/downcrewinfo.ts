import Discord from "discord.js";
import moment from "../../../utils/moment";
import teamMgr from "../../../firebase/teamMgr";
import crew from "../../../utils/crew";
import multiPages from "../../../utils/multiPages";
import tools from "../../../utils/tools";
 
import { CmdType } from "../../../utils/types";
 

export = {
    name: 'downcrewinfo',
    aliases: ["dci"],
    description: '下載團隊資訊',
    permissions: [],
    roles: [],
    users: ["uid00", "uidzz"],
    dbAdmin: true,
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
                const teamInfo = await teamMgr.getTeamInfo(crewid);

                await msg.author.send({
                    files: [{
                        name: `crew_${crewid}_${moment().utcOffset(8).format("YYYY-MM-DD_HH-mm-ss")}_tw.json`,
                        attachment: Buffer.from(JSON.stringify(teamInfo, null, 4), "utf8")
                    }]
                });

                await msg.channel.send({ content: `下載完畢!` });
            }
        });
    },
} as Executor;