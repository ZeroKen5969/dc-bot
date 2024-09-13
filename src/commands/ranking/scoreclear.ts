import Discord from "discord.js";
import tools from "../../utils/tools";
import rank from "../../utils/rank";
import accountDao from "../../database/accountDao";
  
 

export = {
    name: 'scoreclear',
    aliases: ["sclr"],
    description: '清除所有積分',
    permissions: ["ManageGuild"],
    roles: [],

    async execute(client: ZClient, msg: Discord.Message, args: string[]) {
        const members = await msg.guild.members.fetch();

        for (const [_, member] of members) {
            for (let i = 0; i < rank.RankTable.length; ++i) {
                const rid = rank.RankTable[i].role;
                if (member.roles.cache.has(rid)) {
                    await member.roles.remove(rid);
                    await tools.sleep(1500);
                }
            }
        }

        await accountDao.removeAll();

        await msg.channel.send({ content: `清除完畢!` });
    },
} as Executor;