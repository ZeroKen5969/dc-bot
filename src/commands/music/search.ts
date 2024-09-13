import * as kazagumo from "kazagumo";
import Discord from "discord.js";
import tools from "../../utils/tools";
import musicDao from "../../database/musicDao";
  
import { CmdType } from "../../utils/types";
 

export = {
    name: "search",
    aliases: ["sch"],
    description: '搜尋音樂',
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
            requester: msg.author,
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

        res.tracks = res.tracks.slice(0, 10);

        let i = 0;
        const sendMsgs = await tools.sendEmbedMultiMessage(msg, res.tracks, "🔎 **搜尋清單**", 30, (track) => {
            const stream = track.isStream ? `LIVE` : tools.timeFormat(track.length);
            return `\`${++i}.\` \`${track.title}\` - \`${stream}\`\n\n`;
        });

        let index = -1;
        const filter = (m: Discord.Message) => {
            if (m.author.id != msg.author.id) return false;
            if (!m.content.match(/^-?\d+$/)) return false;

            const tmpIndex = parseInt(m.content);
            if (isNaN(tmpIndex)) return false;
            if (tmpIndex > res.tracks.length || tmpIndex <= 0 && tmpIndex != -1) return false;

            index = tmpIndex;

            return true;
        };

        await msg.channel.awaitMessages({
            filter: filter,
            max: 1,
            time: 120 * 1000,
            errors: ['time']
        }).catch(e => {
            console.error(e);
        });

        if (index < 0) {
            await sendMsgs[0].edit({
                content: `終止搜尋...`,
                embeds: []
            });
            return;
        }

        const track = res.tracks[index - 1];

        musicDao.addMusicsToQueue(player.guildId, [track]);
        player.queue.add(track);

        await msg.channel.send({ content: `🎶 已將曲目 \`${track.title}\` 加入隊列` });

        if (!player.playing && !player.paused && player.queue.current) {
            player.play();
        }
    },
} as Executor;