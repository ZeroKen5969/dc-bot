import Discord from "discord.js";
import tools from "../../../utils/tools";
import teamMgr from "../../../firebase/teamMgr";
import crew from "../../../utils/crew";
import { CmdType } from "../../../utils/types";
 

export = {
    name: 'idfind',
    aliases: ["if"],
    description: '以ID尋找遊戲成員',
    permissions: ["ManageGuild"],
    roles: [],
    type: [CmdType.Crew],

    async execute(client: ZClient, msg: Discord.Message, args: string[]) {
        if (args.length < 1) {
            await msg.channel.send({ content: '參數需至少一個!' });
            return;
        }

        const userid = args[0].toLowerCase();

        const may: Game.MemberFullInfo[] = [];

        for (const crewid of crew.crewids) {
            const SubscribeList = await teamMgr.getSubscribeListInfo(crewid);
            for (const info in SubscribeList) {
                const crew_member_id = info.substring(0, info.length / 2).toLowerCase();
                if (crew_member_id.includes(userid)) {
                    may.push({ crewid: crewid, id: info, data: SubscribeList[info] });
                }
            }
        }

        if (may.length > 0) {
            const title = '======= 相似成員 =======\n';

            await tools.sendMultiMessage(msg, may, title, 30, (data: Game.MemberFullInfo) => {
                let fakeId = data.id.substring(0, data.id.length / 2);
                fakeId += '#'.repeat(data.id.length - fakeId.length / 2);
                const crewname = crew.crewidnames[data.crewid];

                return `\`${crewname}\` | Name: \`${data.data.Name}\`, UserId: \`${fakeId}\`\n`;
            });
        } else {
            await msg.channel.send({ content: '查無資料!' });
        }
    },
} as Executor;