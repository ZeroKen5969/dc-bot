import * as shoukaku from "shoukaku";
import * as kazagumo from "kazagumo";
import Discord from "discord.js";
import musicDao from "../database/musicDao";
   

async function restoreMusicStatus(this: ZClient) {
    const musicCaches = await musicDao.loadCacheMusics();

    for (let i = 0; i < musicCaches.length; ++i) {
        const cache = musicCaches[i];
        const guild = this.guilds.cache.get(cache.guildId);
        const vchannel = guild.channels.cache.get(cache.voiceChannel);
        if (!vchannel) {
            return;
        }

        let player = this.manager.players.get(cache.guildId);
        if (!player) {
            player = await this.manager.createPlayer({
                guildId: cache.guildId,
                voiceId: cache.voiceChannel,
                textId: cache.textChannel,
            });
            // player.connect();
        } else {
            if (player.voiceId != cache.voiceChannel) {
                player.setVoiceChannel(cache.voiceChannel);
            }
        }

        cache.musics.forEach((track) => {
            player.queue.add(Object.assign(Object.create(kazagumo.KazagumoTrack.prototype), track));
        });

        if(cache.repeatStatus) {
            player.setLoop(cache.repeatStatus);
        }

        if (!player.playing && !player.paused && player.queue.current) {
            player.play();
        }
    }
}

export function install(client: ZClient) {
    client.restoreMusicStatus = restoreMusicStatus;
    client.manager = new kazagumo.Kazagumo({
        defaultSearchEngine: "youtube",
        send(guildId, payload) {
            const guild = client.guilds.cache.get(guildId);
            if (guild) guild.shard.send(payload);
        },
        plugins: [
            new kazagumo.Plugins.PlayerMoved(client)
        ]
    }, new shoukaku.Connectors.DiscordJS(client), [{
        name: "zzz",
        url: "localhost:8080",
        auth: "youshallnotpass",
    }], {
        reconnectTries: 10,
    });

    client.manager.shoukaku
    .on("ready", (name: string, reconnected: boolean) => {
        console.log(`Node ${name} ready, reconnected: ${reconnected}`);
        client.restoreMusicStatus();
    })
    .on("reconnecting", (name: string, info: string, tries: number, triesLeft: number, reconnectInterval: number) => {
        console.log(`Node reconnecting ${name}, ${info}, ${tries}, ${triesLeft}, ${reconnectInterval}`);
    })
    .on("close", (name: string, code: number, reason: string) => {
        console.log(`Node close ${name}, ${code}, ${reason}`);
    })
    .on("debug", (name: string, info: string) => {
        // console.log(`Node debug ${name}, ${info}`);
    })
    .on("error", (name: string, error: Error) => {
        console.log(`Node error ${name}, ${error}`);
    })
    .on("disconnect", (name: string, players: shoukaku.Player[], moved: boolean) => {
        console.log(`Node disconnect ${name}, ${players}, ${moved}`);
    });

    client.manager
    .on("playerUpdate", (data: unknown) => {
        // console.log(`playerUpdate - raw: ${data}`);
    })
    .on("playerUpdate", (player: kazagumo.KazagumoPlayer, data: shoukaku.PlayerUpdate) => {
        // console.log(`playerUpdate: ${player} | ${data}`);
    })
    .on("playerCreate", (player: kazagumo.KazagumoPlayer) => {
        console.log("playerCreate");
        musicDao.updateMusicChannel(player.guildId, player.voiceId, player.textId);
    })
    .on("playerDestroy", (player: kazagumo.KazagumoPlayer) => {
        console.log("playerDestroy");
        musicDao.destroyGuildMusics(player.guildId);
    })
    .on("playerStart", (player: kazagumo.KazagumoPlayer, track: kazagumo.KazagumoTrack) => {
        console.log("playerStart");
        // const channel = client.channels.cache.get(player.textId) as Discord.TextBasedChannel;
        // channel.send(`🎶 正在播放: \`${track.title}\``);
    })
    .on("playerEnd", (player: kazagumo.KazagumoPlayer) => {
        console.log("playerEnd");
        if(player.loop != "track") {
            musicDao.removeMusicByIndex(player.guildId, 0);
        }

        if(player.loop == "queue") {
            musicDao.addMusicsToQueue(player.guildId, [player.queue[0]]);
        }
    })
    .on("playerStuck", (player: kazagumo.KazagumoPlayer, data: shoukaku.TrackStuckEvent) => {
        const channel = client.channels.cache.get(player.textId) as Discord.TextBasedChannel;
        channel.send(`播放 \`${player.queue.current.title}\` 時發生問題!`);
        player.skip();

        console.log(`trackStuck -> ${data.track}`);
    })
    .on("playerResolveError", (player: kazagumo.KazagumoPlayer, track: kazagumo.KazagumoTrack, message?: string) => {
        console.log(`playerResolveError -> ${player} | ${track.sourceName} | ${message}`);
    })
    .on("playerException", (player: kazagumo.KazagumoPlayer, data: shoukaku.TrackExceptionEvent) => {
        console.log(`trackError -> ${data.error} | ${data.exception?.message} | ${data.exception?.cause}`);
    })
    .on("playerEmpty", (player: kazagumo.KazagumoPlayer) => {
        const channel = client.channels.cache.get(player.textId) as Discord.TextBasedChannel;
        channel.send("所有曲目已播放完畢...");

        player.destroy();
    })
    .on("playerMoved", (player: kazagumo.KazagumoPlayer, state: kazagumo.PlayerMovedState, channels: kazagumo.PlayerMovedChannels) => {
        if (!channels.newChannelId) {
            player.destroy();
        } else {
            musicDao.updateMusicChannel(player.guildId, channels.newChannelId, player.textId);
        }
        console.log(`playerMove ${channels.oldChannelId} -> ${channels.newChannelId}`);
    })
    .on("playerClosed", (player: kazagumo.KazagumoPlayer, data: shoukaku.WebSocketClosedEvent) => {
        console.log(`playerClosed: ${player}`);
        player.pause(true);
    })
    .on("playerResumed", (player: kazagumo.KazagumoPlayer) => {
        console.log(`playerResumed: ${player}`);
        player.pause(false);
    });
}