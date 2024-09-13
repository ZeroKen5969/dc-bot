import * as kazagumo from "kazagumo";
import Discord from "discord.js";
import tools from "../../utils/tools";
import musicDao from "../../database/musicDao";
  
import { CmdType } from "../../utils/types";
 

export = {
    name: "play",
    aliases: ["p"],
    description: '撥放音樂',
    permissions: [],
    roles: [],
    users: [],
    type: [CmdType.Music],

    async execute(client: ZClient, msg: Discord.Message, args: string[]) {
        if (args.length < 1) {
            await msg.channel.send({ content: `需提供網址或歌名!` });
            return;
        }

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
            if (player.state > kazagumo.PlayerState.CONNECTED) {
                await msg.channel.send({ content: `撥放器建立中, 請在稍後嘗試!` });
                return;
            }

            if (msg.member.voice.channel.id != player.voiceId) {
                await msg.channel.send({ content: `此命令需和機器人相同頻道才可使用!` });
                return;
            }
        }

        const playUrl = args.join(" ");

        let res = await client.manager.search(
            playUrl, {
            requester: msg.author
        });

        if (res.tracks.length <= 0) {
            const queryUrl = new URL(playUrl);
            const listParam = queryUrl.searchParams.get("list");

            // 嘗試調整錯誤url
            if (listParam && listParam.startsWith("RD") && queryUrl.pathname == "/playlist") {
                queryUrl.pathname = "/watch";
                queryUrl.searchParams.append("v", listParam.replace(/^RD/, ""));

                res = await client.manager.search(
                    queryUrl.href, {
                    requester: msg.author
                });
            }

            if (res.tracks.length <= 0) {
                await msg.channel.send({ content: `未發現任何曲目!` });
                return;
            }
        }

        switch (res.type) {
            case "PLAYLIST":
                let time = 0;

                musicDao.addMusicsToQueue(player.guildId, res.tracks);

                res.tracks.forEach((track) => {
                    time += track.length;
                    player.queue.add(track);
                });

                await msg.channel.send({ content: `成功加入\`${res.tracks.length}\`首歌曲至隊列 \`(${tools.timeFormat(time)})\`` });
                break;
            default:
                musicDao.addMusicsToQueue(player.guildId, [res.tracks[0]]);

                player.queue.add(res.tracks[0]);

                await msg.channel.send({ content: `🎶 已將曲目 \`${res.tracks[0].title}\` 加入隊列` });
                break;
        }

        if (!player.playing && !player.paused && player.queue.current) {
            player.play();
        }
    },
} as Executor;