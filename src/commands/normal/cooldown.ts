import Discord from "discord.js";
import tools from "../../utils/tools";
  
import { CmdType } from "../../utils/types";
 

export = {
    name: 'cooldown',
    aliases: ["cd"],
    description: '重設成員指令冷卻時間',
    permissions: ["ManageGuild"],
    roles: [],
    type: [CmdType.Universal],
    // slash: {
    //     params: [{
    //         name: "用戶",
    //         type: Discord.ApplicationCommandOptionType.User,
    //     }, {
    //         name: "命令名稱",
    //     }],
    // },

    async execute(client: ZClient, msg: Discord.Message, args: string[]) {
        if (args.length < 2) {
            await msg.channel.send({ content: '參數需至少二個!' });
            return;
        }

        const dcId = tools.pickUserId(args[0]);
        const execname = args[1];

        if (!dcId) {
            await msg.channel.send({ content: '需提供標記名稱!' });
            return;
        }

        const cooldownTag = `${dcId}_${execname}`;

        if (client.cooldown.delete(cooldownTag)) {
            await msg.channel.send({ content: '重設成功!' });
        } else {
            await msg.channel.send({ content: '重設失敗!' });
        }
    },
} as Executor;