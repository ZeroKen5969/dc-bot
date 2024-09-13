import Discord from "discord.js";
import accountDao from "../../database/accountDao";
import userMgr from "../../firebase/userMgr";
import tools from "../../utils/tools";
  
 

export = {
    name: 'gamechat',
    aliases: [],
    description: '遊戲內聊天',
    permissions: ["ManageGuild"],
    roles: [],
    listens: [
        "cid88"
    ],
    hide: true,

    async execute(client: ZClient, msg: Discord.Message) {
        await msg.delete();

        console.log(msg.content);

        const uuid = await accountDao.findChatUser(msg.author.id);
        if (!uuid) {
            await msg.channel.send({ content: `<@${msg.author.id}> __**發話前請先進行聊天綁定!**__` });
            return;
        }

        const userInfo = await userMgr.getBattleInfo(uuid);
        if (!userInfo) {
            await msg.channel.send({ content: `<@${msg.author.id}> __**當前綁定的為無效帳號!**__` });
            return;
        }

        const chatClient = client.newChatClient(uuid);
        const channelName = "040";
        const msgObj = tools.createChatMessage(channelName, uuid, msg.content, userInfo);
        chatClient.pushMessage({
            channel: channelName, 
            content: JSON.stringify(msgObj)
        });
    },
} as Executor;