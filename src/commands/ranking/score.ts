import Discord from "discord.js";
import tools from "../../utils/tools";
import rank from "../../utils/rank";
import accountDao from "../../database/accountDao";
  
 

export = {
    name: 'score',
    aliases: [],
    description: '查詢目前積分',
    permissions: [],
    roles: [],

    async execute(client: ZClient, msg: Discord.Message, args: string[]) {
        let id = msg.member.id;

        if (args.length > 0 && msg.member.permissions.has(Discord.PermissionFlagsBits.ManageGuild)) {
            id = tools.pickUserId(args[0]) || id;
        }

        const acc = await accountDao.find(id);
        const rankTable = rank.RankTable;

        await msg.channel.send({ content: `<@${id}> 目前分數: ${acc.score}, 階級: ${rankTable[acc.rank].name}` });
    },
} as Executor;