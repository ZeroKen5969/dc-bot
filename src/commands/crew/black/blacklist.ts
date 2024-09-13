import Discord from "discord.js";
import tools from "../../../utils/tools";
import multiPages from "../../../utils/multiPages";
import blackListDao from "../../../database/blackListDao";
import { CmdType } from "../../../utils/types";
 

export = {
    name: 'blacklist',
    aliases: ["blist"],
    description: '獲取黑名單資訊',
    permissions: ["ManageGuild"],
    roles: [],
    users: [],
    type: [CmdType.Crew],

    async execute(client: ZClient, msg: Discord.Message, args: string[]) {
        const blackInfo = await blackListDao.getBlackInfo();
        const blackList = Object.keys(blackInfo.blackList);

        if (blackList.length > 0) {
            let counter = 0;
            const pages = tools.createEmbedMultiMessage(msg, blackList, "**黑名單資訊**", 15, (data) => {
                return `${++counter}. \`${data}\`\n\n`;
            });

            await multiPages.sendMultiPages(msg, pages, 60000);
        } else {
            await msg.channel.send({ content: `查無資料!` });
        }
    },
} as Executor;