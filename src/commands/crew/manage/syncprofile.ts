import Discord from "discord.js";
import teamMgr from "../../../firebase/teamMgr";
import crew from "../../../utils/crew";
import multiPages from "../../../utils/multiPages";
import tools from "../../../utils/tools";
import userMgr from "../../../firebase/userMgr";
 
import { CmdType } from "../../../utils/types";

export = {
    name: 'syncprofile',
    aliases: ["sp"],
    description: '同步團隊頭像和某玩家相同',
    permissions: ["ManageGuild"],
    roles: [],
    type: [CmdType.Crew],

    async execute(client: ZClient, msg: Discord.Message, args: string[]) {
        if (args.length < 1) {
            await msg.channel.send({ content: '需給予遊戲ID!' });
            return;
        }

        const uuid = args[0].trim();

        if (!uuid.length) {
            await msg.channel.send({ content: '團名需長度需大於零!' });
            return;
        }

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

                const data = await userMgr.getBattleInfo(uuid);

                await teamMgr.changeProfile(crewid, data.Profile);

                await msg.channel.send({ content: `已設置團隊頭像為${data.Profile}` });
            }
        });
    },
} as Executor;