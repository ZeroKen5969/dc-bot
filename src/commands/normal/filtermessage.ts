import Discord from "discord.js";
  
 

export = {
    name: 'filtermessage',
    aliases: [],
    description: '過濾違規訊息',
    permissions: [],
    roles: [],
    listens: [
    ],
    hide: true,
    bot: true,

    async execute(client: ZClient, msg: Discord.Message) {
        if (msg.member.permissions.has(Discord.PermissionFlagsBits.ManageGuild)) return;

        const replyMsg = "已自動刪除屏蔽訊息!";

        if (msg.embeds) {
            for (let i = 0; i < msg.embeds.length; ++i) {
                const embed = msg.embeds[i];

                if (embed.image && embed.image.url) {
                    const imgUrl = new URL(embed.image.url);
                    if (imgUrl.hostname.includes("wnacg.org") ||
                        imgUrl.hostname.includes("nhentai.net")) {
                        await msg.delete();
                        await msg.channel.send({ content: replyMsg });
                        break;
                    }
                }
            }
        }
    },
} as Executor;