import Discord from "discord.js";
import tools from "../../../utils/tools";
import bindingDao from "../../../database/bindingDao";
import teamMgr from "../../../firebase/teamMgr";
import config from "../../../utils/config";
import crew from "../../../utils/crew";
 
import { CmdType } from "../../../utils/types";
 

export = {
    name: 'noregister',
    aliases: ["noreg"],
    description: '查詢仍未綁定的DC成員',
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

        const ret = tools.filtUnBindGuildMembers(members, bindData, allMembers).filter((m) => m.roles.cache.has(config.command.noregister.rid));

        if (ret.length > 0) {
            const title = '======= 未綁定成員 =======\n';

            await tools.sendMultiMessage(msg, ret, title, 30, (data) => {
                const username = data.nickname ? data.nickname : data.user.username;
                return `Tag: <@${data.id}>, Name: ${username}\n`;
            });
        } else {
            await msg.channel.send({ content: '未發現未綁定成員!' });
        }
    },
} as Executor;