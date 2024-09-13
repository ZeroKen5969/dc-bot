import Discord from "discord.js";
   
 

import auth from "../utils/auth";

const PAUSE_INTERVAL = 5000;

export = {
    name: "voiceStateUpdate",

    async execute(client: ZClient, oldState: Discord.VoiceState, newState: Discord.VoiceState) {
        if (!auth.isAuthGuild(oldState.guild.id)) return;
        if (!auth.isAuthGuild(newState.guild.id)) return;
        if (newState.member.id != client.user.id) return;

        console.log("VoiceStateUpdate ->", oldState.deaf, newState.deaf, oldState.mute, newState.mute);
        console.log(oldState.channelId, newState.channelId);

        // let player = client.manager.players.get(newState.guild.id);
        
        // if (!newState.channelId) {
        //     if (player) {
        //         player.destroy();
        //     }
        // } else {
        //     if (oldState.deaf != newState.deaf || oldState.mute != newState.mute) {
        //         if (!newState.deaf || !newState.mute) {
        //             setTimeout(function () {
        //                 player = client.manager.players.get(newState.guild.id);
        //                 if (player) {
        //                     player.pause(false);
        //                 }
        //             }, PAUSE_INTERVAL);
        //         } else {
        //             player.pause(true);
        //         }
        //     }
        // }
    },
} as Executor;