import Discord from "discord.js";
import tools from "../../utils/tools";
  
import { CmdType } from "../../utils/types";
 

export = {
    name: 'memberavatar',
    aliases: ["memavt"],
    description: '查看成員頭像',
    permissions: [],
    roles: [],
    type: [CmdType.Universal],

    async execute(client: ZClient, msg: Discord.Message, args: string[]) {
        let userid: string;

        if (args.length > 0) {
            userid = tools.pickUserId(args[0]);
        }

        userid = userid || msg.author.id;

        const member = await tools.getGuildMember(msg.guild.members, userid);

        const embed = new Discord.EmbedBuilder()
            .setImage(member.displayAvatarURL({ size: 4096 }))
            .setFooter({
                text: msg.author.tag,
                iconURL: msg.member.displayAvatarURL()
            });

        await msg.channel.send({ embeds: [embed] });
    },
} as Executor;