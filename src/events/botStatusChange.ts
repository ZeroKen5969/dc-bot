import Discord from "discord.js";
import listenMsgs from "../utils/listenMsgs";
 

export = {
    name: "botStatusChange",

    async execute(client: ZClient, reaction: Discord.MessageReaction, user: Discord.User, msgIndex: number, isAdd: boolean) {
        if (isAdd) {
            const info = listenMsgs.MsgInfo[msgIndex] as EchoMessage;
            const tag = reaction.emoji.id ? `<:${reaction.emoji.name}:${reaction.emoji.id}>` : reaction.emoji.name;

            await reaction.users.remove(user.id);
            await reaction.message.edit({ content: `\`${info.name}\` 狀態: ${tag == "⭕" ? "開" : "關"}(${tag})` });
            client.botStatus.set(info.name, tag == "⭕");
        }
    }
} as Executor;