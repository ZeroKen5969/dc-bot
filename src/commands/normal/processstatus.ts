import Discord from "discord.js";
import tools from "../../utils/tools";
  
import { CmdType } from "../../utils/types";
 

export = {
    name: 'processstatus',
    aliases: ["ps"],
    description: '取得程序分析資料',
    permissions: [],
    roles: [],
    users: ["uid00", "uidzz"],
    dbAdmin: true,
    type: [CmdType.Universal],

    async execute(client: ZClient, msg: Discord.Message, args: string[]) {
        const msgBuf = [];

        const mi = tools.getMemoryInfo();

        msgBuf.push("**使用量**");
        msgBuf.push("```");
        msgBuf.push(`總共: ${mi.total.amount_mb}MB`);
        msgBuf.push(`使用: ${mi.usage.amount_mb}MB - ${mi.usage.percent}%`);
        msgBuf.push(`剩餘: ${mi.free.amount_mb}MB - ${mi.free.percent}%`);
        msgBuf.push("```");

        const pss = await tools.getProcessInfo();

        msgBuf.push("**使用量排名**");
        msgBuf.push("```");
        for (let i = 0; i < pss.length; ++i) {
            const ps = pss[i];
            msgBuf.push(`${i + 1}. 使用量: ${(ps.usage / 1024 / 1024).toFixed(2)}MB 百分比: ${ps.percent}% PID: ${ps.pid} 名稱: ${ps.name}`);
        }
        msgBuf.push("```");

        await tools.sendEmbedMultiMessage(msg, msgBuf, `📊**記憶體分析**`, 30, (data) => {
            return `${data}\n`;
        });
    },
} as Executor;