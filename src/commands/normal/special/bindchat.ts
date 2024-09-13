import Discord from "discord.js";
import accountDao from "../../../database/accountDao";
 
import { CmdType } from "../../../utils/types";
 

export = {
    name: "bindchat",
    aliases: [],
    description: '綁定發送遊戲內訊息的帳號',
    permissions: ["ManageGuild"],
    roles: [],
    users: [],
    type: [CmdType.Crew],

    async execute(client: ZClient, msg: Discord.Message, args: string[]) {
        if (args.length < 1) {
            await msg.reply({ content: '需給予綁定id!' });
            return;
        }

        const uuid = args[0];
        await accountDao.bindChatUser(msg.author.id, uuid);
        await msg.reply({ content: '綁定完成!' });
    },
} as Executor;