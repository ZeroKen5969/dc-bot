import Discord from "discord.js";
import tools from "../../../utils/tools";
import userMgr from "../../../firebase/userMgr";
 
import { CmdType } from "../../../utils/types";
 

export = {
    name: 'checkbaninfo',
    aliases: ["cbi"],
    description: '查詢鎖帳資訊',
    permissions: ["ManageGuild"],
    roles: [],
    users: [],
    type: [CmdType.Crew],

    async execute(client: ZClient, msg: Discord.Message, args: string[]) {
        if (args.length < 1) {
            await msg.channel.send({ content: '參數需至少一個!' });
            return;
        }

        const gameId = args[0];

        const results = await Promise.all([
            userMgr.getBanInfo(gameId),
            userMgr.getReportInfo(gameId),
            userMgr.getCheatInfo(gameId),
            userMgr.getOldReportInfo(gameId),
        ]);

        const msgBuf = [];

        results.forEach((res => {
            if (res) msgBuf.push(res);
        }));

        if (msgBuf.length > 0) {
            await tools.sendEmbedMultiMessage(msg, msgBuf, "封鎖訊息", 15, (data) => {
                return `${data}\n\n`;
            });
        } else {
            await msg.channel.send({ content: `查無資料!` });
        }
    },
} as Executor;