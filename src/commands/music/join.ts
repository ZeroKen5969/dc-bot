import Discord from "discord.js";
  
 
import { CmdType } from "../../utils/types";

export = {
    name: "join",
    aliases: [],
    description: '使機器人加入目前語音頻道',
    permissions: [],
    roles: [],
    users: [],
    type: [CmdType.Music],

    async execute(client: ZClient, msg: Discord.Message, args: string[]) {
        if (!msg.member.voice.channel) {
            await msg.channel.send({ content: `此命令需在語音頻道中使用!` });
            return;
        }

        const guild = client.guilds.cache.get(msg.guild.id);
        const vchannel = guild.channels.cache.get(msg.member.voice.channel.id);
        if (!vchannel) {
            await msg.channel.send({ content: `未發現語音頻道!` });
            return;
        }

        let player = client.manager.players.get(msg.guild.id);
        if (!player) {
            player = await client.manager.createPlayer({
                guildId: msg.guild.id,
                voiceId: msg.member.voice.channel.id,
                textId: msg.channel.id,
            });
        } else {
            if (player.voiceId != msg.member.voice.channel.id) {
                player.setVoiceChannel(msg.member.voice.channel.id);
            }
        }
    },
} as Executor;