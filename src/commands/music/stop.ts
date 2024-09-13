import Discord from "discord.js";
  
 
import { CmdType } from "../../utils/types";

export = {
    name: "stop",
    aliases: [],
    description: '停止音樂播放器',
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

        player.destroy();

        await msg.channel.send({ content: "音樂播放器已停止!" });
    },
} as Executor;