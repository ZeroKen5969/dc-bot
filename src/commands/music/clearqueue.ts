import Discord from "discord.js";
import musicDao from "../../database/musicDao";
  
 
import { CmdType } from "../../utils/types";

export = {
    name: "clearqueue",
    aliases: ["cq"],
    description: '清空隊列',
    permissions: [],
    roles: [],
    users: [],
    type: [CmdType.Music],

    async execute(client: ZClient, msg: Discord.Message, args: string[]) {
        const player = client.manager.players.get(msg.guild.id);

        if (!player) {
            await msg.channel.send({ content: "尚未創建音樂播放器!" });
            return;
        }

        if (!msg.member.voice.channel) {
            await msg.channel.send({ content: `此命令需在語音頻道中使用!` });
            return;
        }

        if (msg.member.voice.channel.id != player.voiceId) {
            await msg.channel.send({ content: `此命令需和機器人相同頻道才可使用!` });
            return;
        }

        musicDao.clearMusicByRange(player.guildId, 1, player.queue.totalSize);

        player.queue.clear();

        await msg.channel.send({ content: "已清空當前隊列!" });
    },
} as Executor;