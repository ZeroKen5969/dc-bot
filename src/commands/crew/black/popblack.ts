import Discord from "discord.js";
import blackListDao from "../../../database/blackListDao";
 
import { CmdType } from "../../../utils/types";

export = {
    name: 'popblack',
    aliases: ["popb"],
    description: '從黑名單刪除某ID',
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

        const result = await blackListDao.removeBlackId(id);

        if (result && result.modifiedCount > 0) {
            await msg.channel.send({ content: `成功從黑名單移除\`${id}\`!` });
        } else {
            await msg.channel.send({ content: `從黑名單移除\`${id}\`失敗, 請確認ID是否完全一致!` });
        }
    },
} as Executor;