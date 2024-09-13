import Discord from "discord.js";
import listenMsgs from "../utils/listenMsgs";

function loadMessages(this: ZClient) {
    for (let i = 0; i < listenMsgs.MsgInfo.length; ++i) {
        const info = listenMsgs.MsgInfo[i] as EchoMessage;

        this.channels.fetch(info.cid).then((channel: Discord.Channel & Discord.TextBasedChannel) => {
            channel.messages.fetch(info.id)
                .then(async (msg) => {
                    for (const [key, val] of Object.entries(info.echo || {})) {
                        await msg.react(key);
                    }
                    for (const [key, val] of Object.entries(info.callbackEvent || {})) {
                        await msg.react(key);
                    }

                    if (info.name) {
                        this.botStatus.set(info.name, msg.content.includes("⭕"));
                    }
                });
        });
    }
}

export function install(client: ZClient) {
    client.loadMessages = loadMessages;
}