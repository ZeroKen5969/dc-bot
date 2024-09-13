import game from "../utils/game";
import config from "../utils/config";
   
 
import { EventType } from "../utils/types";

export = {
    name: EventType.ChatClientChatMessages,

    async execute(client: ZClient, channelName: string, messages: Photon.Chat.Message[]) {
        const contentHandler = async (content: Game.ChatContent) => {
            if (content.cmtype == game.ChatMessageType.Normal) {
                const cf = config.event.chatClientChatMessages[channelName];
                if (cf) {
                    const botSelf = client.getChannelInfo(cf.gid, cf.cid);
                    await botSelf.channel.send({ content: `${content.name}: ${content.ct}` });
                }
            }
        };

        for (const message of messages) {
            let jsonObj: Game.ChatContent = null;

            try {
                const content: string = message.getContent();
                const jsonStr = content.replace(/[\u0000-\u001F\u0080-\uFFFF]/g, (match) => {
                    const hexstr = `0000${match.charCodeAt(0).toString(16)}`;
                    return `\\u${hexstr.substring(hexstr.length - 4)}`;
                });
                jsonObj = JSON.parse(jsonStr);
            } catch(e) {
                console.log(message, e);
                throw Error();
            }

            if (Array.isArray(jsonObj)) {
                // for (const data of content) {
                //     await contentHandler(data);
                // }
            } else {
                await contentHandler(jsonObj);
            }
        }
    }
} as Executor;