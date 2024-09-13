import Discord from "discord.js";
import blackListDao from "../../../database/blackListDao";
 
import { CmdType } from "../../../utils/types";

export = {
    name: 'pushblack',
    aliases: ["pushb"],
    description: '加入某ID至黑名單',
    permissions: ["ManageGuild"],
    roles: [],
    users: [],
    type: [CmdType.Crew],

    async execute(client: ZClient, msg: Discord.Message, args: string[]) {
        if (args.length < 1) {
            await msg.channel.send({ content: '需給予黑名單ID!' });
            return;
        }

        const id = args[0];

        await blackListDao.addBlackId(id);

        await msg.channel.send({ content: `成功添加\`${id}\`至黑名單!` });
    },
} as Executor;