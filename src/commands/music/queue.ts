import Discord from "discord.js";
import tools from "../../utils/tools";
import multiPages from "../../utils/multiPages";
  
import { CmdType } from "../../utils/types";
 

export = {
    name: "queue",
    aliases: ["q"],
    description: '獲取播放隊列',
    permissions: [],
    roles: [],
    users: [],
    type: [CmdType.Music],

    async execute(client: ZClient, msg: Discord.Message, args: string[]) {
        const player = client.manager.players.get(msg.guild.id);
        if (!player || player.queue.size <= 0) {
            await msg.channel.send({ content: `隊列當前無任何曲目` });
        } else {
            let i = 0;
            const pages = tools.createEmbedMultiMessage(msg, player.queue, "🎶 **隊列清單**", 15, (track) => {
                const stream = track.isStream ? `LIVE` : tools.timeFormat(track.length);
                return `\`${++i}.\` \`${track.title}\` - \`${stream}\` - <@${(track.requester as Discord.User).id}>\n\n`;
            });

            await multiPages.sendMultiPages(msg, pages, 120 * 1000, {
                filter(reaction, user) {
                    return multiPages.btnTable.includes(reaction.emoji.name) && user.id == msg.author.id;
                }
            });
        }
    },
} as Executor;