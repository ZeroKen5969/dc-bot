import Discord from "discord.js";
import tools from "../../utils/tools";
import rank from "../../utils/rank";
import accountDao from "../../database/accountDao";
  
 

export = {
    name: 'ranklist',
    aliases: ["rl"],
    description: '取得分數排行',
    permissions: [],
    roles: [],

    async execute(client: ZClient, msg: Discord.Message, args: string[]) {
        let customMax = -1;

        if (args.length > 0) {
            if (args[0].match(/^\d+$/)) {
                customMax = parseInt(args[0]);
            } else {
                await msg.channel.send({ content: '分數需是數字!' });
                return;
            }
        }

        let accs = await accountDao.findAll();
        const rankTable = rank.RankTable;
        const members = await msg.guild.members.fetch();

        const msgs = [];

        accs.sort((x, y) => { return y.score - x.score; });

        accs = accs.filter((acc) => {
            const member = members.get(acc.userId);
            return member && !member.permissions.has(Discord.PermissionFlagsBits.ManageGuild);
        });

        if (customMax < 0) {
            customMax = accs.length;
        }

        const maxSeq = Math.min(accs.length, customMax);
        const need = Math.floor(Math.log(maxSeq) / Math.log(10));

        for (let i = 0; i < maxSeq; ++i) {
            const acc = accs[i];

            const have = Math.floor(Math.log(i + 1) / Math.log(10));
            const fill = "0".repeat(need - have);

            msgs.push(`#${fill}${i + 1} | <@${acc.userId}> 分數: \`${acc.score}\`, 階級: \`${rankTable[acc.rank].name}\``);
        }

        if (msgs.length > 0) {
            const title = ":trophy: **積分排行**";

            await tools.sendEmbedMultiMessage(msg, msgs, title, 30, (data) => {
                return `${data}\n`;
            });
        } else {
            await msg.channel.send({ content: '查無資料!' });
        }
    },
} as Executor;