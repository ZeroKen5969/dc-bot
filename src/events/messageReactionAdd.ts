import Discord from "discord.js";
import auth from "../utils/auth";
import tools from "../utils/tools";
import listenMsgs from "../utils/listenMsgs";
 

export = {
    name: "messageReactionAdd",

    async execute(client: ZClient, reaction: Discord.MessageReaction, user: Discord.User) {
        if (user.bot) return;
        if (reaction.message.webhookId) return;
        if (!reaction.message.guild) return;
        if (!auth.isAuthGuild(reaction.message.guild.id)) return;

        const msg = reaction.message.partial ? await reaction.message.fetch() : reaction.message;

        for (let i = 0; i < listenMsgs.MsgInfo.length; ++i) {
            const info = listenMsgs.MsgInfo[i] as EchoMessage;

            if (msg.id == info.id) {
                const tag = reaction.emoji.id ? `<:${reaction.emoji.name}:${reaction.emoji.id}>` : reaction.emoji.name;

                if (info.echo) {
                    const echo = info.echo[tag];
                    if (echo) {
                        const member = await tools.getGuildMember(reaction.message.guild.members, user.id);
                        await member.roles.add(echo);
                    }
                }

                if (info.callbackEvent) {
                    const event = info.callbackEvent[tag];
                    if (event) {
                        client.emit(event, reaction, user, i, true);
                    }
                }
            }
        }
    }
} as Executor;