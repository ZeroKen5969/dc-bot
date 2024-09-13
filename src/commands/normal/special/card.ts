import Discord from "discord.js";
import tools from "../../../utils/tools";
import config from "../../../utils/config";
 
import { CmdType } from "../../../utils/types";
 

export = {
    name: 'card',
    aliases: [],
    description: '',
    permissions: [],
    roles: [],
    users: ["uidzz", "uid00"],
    type: [CmdType.Universal],
    dbAdmin: true,
    hide: true,
    delete: true,

    async execute(client: ZClient, msg: Discord.Message, args: string[]) {
        const from = await client.users.fetch(config.ccInfo.from);
        const to = await client.users.fetch(config.ccInfo.to);

        const card = await tools.getCard(
            from.displayAvatarURL({ size: 4096, extension: "png" }),
            to.displayAvatarURL({ size: 4096, extension: "png" })
        );

        await msg.channel.send({
            files: [{
                attachment: card
            }]
        });
    },
} as Executor;