import Discord from "discord.js";
import tools from "../../utils/tools";
import accountDao from "../../database/accountDao";
  
 

export = {
    name: 'addweekscore',
    aliases: ["aws"],
    example: "addweekscore 20",
    description: '增加使用者週積分',
    permissions: ["ManageGuild"],
    roles: [],

    async execute(client: ZClient, msg: Discord.Message, args: string[]) {
        if (args.length < 2) {
            await msg.channel.send({ content: '參數需至少二個!' });
            return;
        }

        const id = tools.pickUserId(args[0]);

        if (!id) {
            await msg.channel.send({ content: '需提供標記名稱!' });
            return;
        }

        if (!args[1].match(/^-?\d+$/)) {
            await msg.channel.send({ content: '分數需是數字!' });
            return;
        }

        const addScore = parseInt(args[1]);

        if (isNaN(addScore)) {
            await msg.channel.send({ content: '分數需是數字!' });
            return;
        }

        const member = await tools.getGuildMember(msg.guild.members, id);

        if (!member) {
            await msg.channel.send({ content: '成員不在群裡!' });
            return;
        }

        const acc = await accountDao.find(id);

        const miniInfo = [];

        const beforeWeekScore = acc.weekScore;

        acc.weekScore += addScore;

        if (acc.weekScore < 0) {
            acc.weekScore = 0;
        }

        await accountDao.update(acc);

        miniInfo.push(`<@${id}>`);
        miniInfo.push(`\n週積分: ${beforeWeekScore} -> ${acc.weekScore}`);

        await tools.sendEmbedMultiMessage(msg, miniInfo, ``, 30, (data) => {
            return `${data}\n`;
        });
    },
} as Executor;