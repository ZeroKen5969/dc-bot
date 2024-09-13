import Discord from "discord.js";
import crew from "../../../utils/crew";
import teamMgr from "../../../firebase/teamMgr";
 
import { CmdType } from "../../../utils/types";

export = {
    name: 'removeuser',
    aliases: ["rmuser"],
    description: '強制移除團隊成員',
    permissions: ["ManageGuild"],
    roles: [],
    type: [CmdType.Crew],

    async execute(client: ZClient, msg: Discord.Message, args: string[]) {
        if (args.length < 1) {
            await msg.channel.send({ content: '參數需至少一個!' });
            return;
        }

        const uuid = args[0];

        for (const crewid of crew.crewids) {
            const SubscribeList = await teamMgr.getSubscribeListInfo(crewid);
            if (SubscribeList[uuid]) {
                const result = await teamMgr.kickMember(crewid, uuid);

                if (result == null) {
                    await msg.channel.send({ content: `UUID\`${uuid}\`不在團隊名單!` });
                } else {
                    await msg.channel.send({ content: `UUID\`${uuid}\`已被強制移除!` });
                }

                return;
            }
        }

        await msg.channel.send({ content: `查無資料!` });
    },
} as Executor;