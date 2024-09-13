import Discord from "discord.js";
import musicDao from "../../database/musicDao";
  
 
import { CmdType } from "../../utils/types";

export = {
    name: "repeat",
    aliases: ["loop"],
    example: "loop all",
    description: '重複播放當前歌曲, 加all為重複播放隊列歌曲',
    permissions: [],
    roles: [],
    users: [],
    type: [CmdType.Music],

    async execute(client: ZClient, msg: Discord.Message, args: string[]) {
        const player = client.manager.players.get(msg.guild.id);

        if (!player) {
            await msg.channel.send({ content: `音樂播放器尚未創建!` });
            return;
        }

        if (!msg.member.voice.channel || msg.member.voice.channel.id != player.voiceId) {
            await msg.channel.send({ content: `此命令需和機器人相同頻道才可使用!` });
            return;
        }

        let target: string = null;

        if (args.length >= 1) {
            target = args[0];
        }

        if (target == "all") {
            const status = player.loop == "queue" ? "none" : "queue";
            player.setLoop(status);
            musicDao.updateLoopStatus(player.guildId, status);
            await msg.channel.send({ content: `隊列循環播放已${player.loop != "none" ? "開啟" : "關閉"}!` });
        } else {
            const status = player.loop == "track" ? "none" : "track";
            player.setLoop(status);
            musicDao.updateLoopStatus(player.guildId, status);
            await msg.channel.send({ content: `單曲循環播放已${player.loop != "none" ? "開啟" : "關閉"}!` });
        }
    },
} as Executor;