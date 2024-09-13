import Discord from "discord.js";
import moment from "../../../utils/moment";
import tools from "../../../utils/tools";
import multiPages from "../../../utils/multiPages";
import teamMgr from "../../../firebase/teamMgr";
import userMgr from "../../../firebase/userMgr";
import crew from "../../../utils/crew";
import { CmdType } from "../../../utils/types";
 

export = {
    name: 'checkreport',
    aliases: ["cr"],
    description: '檢查被檢舉的危險成員',
    permissions: ["ManageGuild"],
    roles: [],
    type: [CmdType.Crew],

    async execute(client: ZClient, msg: Discord.Message, args: string[]) {
        let gameName = null;

        if (args.length >= 1) {
            gameName = args[0].toLowerCase();
        }


        const actions: Promise<number>[] = [];
        const members: Game.MemberFullInfo[] = [];
        const may: Game.MemberFullInfo[] = [];

        for (const crewid of crew.crewids) {
            const SubscribeList = await teamMgr.getSubscribeListInfo(crewid);

            for (const info in SubscribeList) {
                const crew_member = SubscribeList[info];
                const crew_member_name = crew_member.Name.toLowerCase();

                if (gameName) {
                    if (crew_member_name.includes(gameName) || gameName.includes(crew_member_name)) {
                        actions.push(userMgr.getReportInfo(info));
                        members.push({ crewid: crewid, id: info, data: crew_member });
                    }
                } else {
                    actions.push(userMgr.getReportInfo(info));
                    members.push({ crewid: crewid, id: info, data: crew_member });
                }
            }
        }

        await Promise.all(actions)
            .then((values) => {
                for (let i = 0; i < values.length; ++i) {
                    const res = values[i];

                    if (res >= 3) {
                        members[i].report = res;

                        may.push(members[i]);
                    }
                }
            });

        may.sort((x, y) => y.data.Level - x.data.Level);

        if (may.length > 0) {
            const title = `🔎 危險成員`;

            let counter = 0;
            const pages = tools.createEmbedMultiMessage(msg, may, title, 10, (data: Game.MemberFullInfo) => {
                const last = moment.tz(data.data.LoginDate, 'MM/DD/YYYY hh:mm:ss a', 'Asia/Seoul');
                const curr = moment().utcOffset(9);
                const dateFmt = tools.timeFormat(curr.diff(last), true);

                const fakeId = data.id.substring(0, data.id.length / 2);
                const crewname = crew.crewidnames[data.crewid];

                return `${++counter}. \`${crewname}\` | 名稱: \`${data.data.Name}\` 等級: \`${data.data.Level + 1}\` ID: \`${fakeId}\` 檢舉: \`${data.report}\` 最後上線: \`${dateFmt}\`\n\n`;
            });

            await multiPages.sendMultiPages(msg, pages, 60000);
        } else {
            await msg.channel.send({ content: `查無資料!` });
        }
    },
} as Executor;