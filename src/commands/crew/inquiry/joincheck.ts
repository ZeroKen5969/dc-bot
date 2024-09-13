import Discord from "discord.js";
import tools from "../../../utils/tools";
import multiPages from "../../../utils/multiPages";
import bindingDao from "../../../database/bindingDao";
import teamMgr from "../../../firebase/teamMgr";
import crew from "../../../utils/crew";
import { CmdType } from "../../../utils/types";
 

export = {
    name: 'joincheck',
    aliases: ["jc"],
    description: '檢查未入團隊的DC成員',
    permissions: ["ManageGuild"],
    roles: [],
    type: [CmdType.Crew],

    async execute(client: ZClient, msg: Discord.Message, args: string[]) {
        const bindData = await bindingDao.findAll();
        const members = await msg.guild.members.fetch();

        let allMembers: Game.MembersInfo = {};

        for (const crewid of crew.crewids) {
            const SubscribeList = await teamMgr.getSubscribeListInfo(crewid);
            allMembers = { ...allMembers, ...SubscribeList };
        }

        const ret = tools.filtUnBindGuildMembers(members, bindData, allMembers);

        if (ret.length > 0) {
            const title = `🔎 未入團隊`;

            let counter = 0;
            const pages = tools.createEmbedMultiMessage(msg, ret, title, 10, (data) => {
                const username = data.nickname ? data.nickname : data.user.username;
                return `${++counter}. Tag: <@${data.id}>, Name: ${username}\n\n`;
            });

            await multiPages.sendMultiPages(msg, pages, 60000);
        } else {
            await msg.channel.send({ content: '查無資料!' });
        }
    },
} as Executor;