import Discord from "discord.js";
import tools from "../../utils/tools";
  
import { CmdType } from "../../utils/types";
 

export = {
    name: 'clear',
    aliases: ["clr"],
    description: '清除頻道聊天紀錄',
    permissions: ["ManageMessages"],
    roles: [],
    type: [CmdType.Universal],

    async execute(client: ZClient, msg: Discord.Message, args: string[]) {
        let amount = 100;

        if (args.length > 0) {
            if (args[0].match(/^\d+$/)) {
                amount = parseInt(args[0]);
            } else {
                msg.channel.send({ content: '參數需是數字!' });
                return;
            }
        }

        const MAX_DELETE_AMOUNT = 100;
        const INTERVAL = 2000;

        const count = Math.floor(amount / MAX_DELETE_AMOUNT);
        const remain = amount % MAX_DELETE_AMOUNT;

        await msg.delete();
        await tools.sleep(INTERVAL);

        const messageDeletor = async (num: number): Promise<void> => {
            const channel = msg.channel as Discord.TextChannel;
            const messages = await msg.channel.messages.fetch({ limit: num });
            const deletedMsgs = await channel.bulkDelete(messages, true);
            
            let surplusMsgs = messages;
            if (deletedMsgs.size) {
                const resMsgs = new  Discord.Collection<string, Discord.Message>();
                for (const [key, val] of messages) {
                    if (!deletedMsgs.has(key)) {
                        resMsgs.set(key, val);
                    }
                }
            }

            for (const [_, m] of surplusMsgs) {
                await m.delete();
                await tools.sleep(INTERVAL);
            }
        };

        for (let i = 0; i < count; ++i) {
            await messageDeletor(MAX_DELETE_AMOUNT);
        }

        if (remain > 0) {
            await messageDeletor(remain);
        }
    },
} as Executor;