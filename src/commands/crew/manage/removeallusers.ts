import Discord from "discord.js";
import teamMgr from "../../../firebase/teamMgr";
import crew from "../../../utils/crew";
import tools from "../../../utils/tools";
import { CmdType } from "../../../utils/types";
 

export = {
    name: 'removeallusers',
    aliases: ["rmusers"],
    description: '強制移除所有格式異常的團隊成員',
    permissions: ["ManageGuild"],
    roles: [],
    type: [CmdType.Crew],

    async execute(client: ZClient, msg: Discord.Message, args: string[]) {
        const members: Game.MemberFullInfo[] = [];
        const kickActions: Promise<Game.MemberInfo>[] = [];

        for (const crewid of crew.crewids) {
            const SubscribeList = await teamMgr.getSubscribeListInfo(crewid);
            for (const id in SubscribeList) {
                const crew_member = SubscribeList[id];
                if (crew_member.Name == undefined) {
                    kickActions.push(teamMgr.kickMember(crewid, id));
                    members.push({ crewid: crewid, id: id, data: crew_member });
                }
            }
        }

        if (kickActions.length) {
            const results = await Promise.all(kickActions);

            tools.sendEmbedMultiMessage(msg, results, "被剔除成員", 30, (crew_member, idx) => {
                const member: Game.MemberFullInfo = members[idx];
                const crewname = crew.crewidnames[member.crewid];
                return `\`${crewname}\` | UUID\`${member.id}\`已被強制移除!\n`;
            });
        } else {
            await msg.channel.send({ content: `查無資料!` });
        }
    },
} as Executor;