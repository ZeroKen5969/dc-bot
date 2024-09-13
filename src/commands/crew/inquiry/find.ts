import moment from "../../../utils/moment";
import tools from "../../../utils/tools";
import multiPages from "../../../utils/multiPages";
import teamMgr from "../../../firebase/teamMgr";
import crew from "../../../utils/crew";
import { CmdType } from "../../../utils/types";
 

export = {
    name: 'find',
    aliases: ["f"],
    description: '以名稱尋找遊戲成員',
    permissions: ["ManageGuild"],
    roles: [],
    type: [CmdType.Crew],
    // slash: {
    //     params: [{
    //         name: "遊戲名稱",
    //     }],
    // },

    async execute(client: ZClient, msg: InteractionMessage, args: string[]) {
        if (args.length < 1) {
            msg.channel.send({ content: '參數需至少一個!' });
            return;
        }

        const username = args[0].toLowerCase();

        const may: Game.MemberFullInfo[] = [];

        for (const crewid of crew.crewids) {
            const SubscribeList = await teamMgr.getSubscribeListInfo(crewid);

            for (const info in SubscribeList) {
                const crew_member = SubscribeList[info];
                const crew_member_name = crew_member.Name.toLowerCase();

                if (crew_member_name.includes(username)) {
                    may.push({ crewid: crewid, id: info, data: SubscribeList[info] });
                }
            }
        }

        if (may.length > 0) {
            const title = `🔎 相似成員`;

            let counter = 0;
            const pages = tools.createEmbedMultiMessage(msg, may, title, 10, (data: Game.MemberFullInfo) => {
                const last = moment.tz(data.data.LoginDate, 'MM/DD/YYYY hh:mm:ss a', 'Asia/Seoul');
                const curr = moment().utcOffset(9);
                const dateFmt = tools.timeFormat(curr.diff(last), true);

                const crewname = crew.crewidnames[data.crewid];

                return `${++counter}. \`${crewname}\` | 名稱: \`${data.data.Name}\` 等級: \`${data.data.Level + 1}\` ID: \`${data.id}\` 最後上線: \`${dateFmt}\`\n\n`;
            });

            await multiPages.sendMultiPages(msg, pages, 60000);
        } else {
            await msg.channel.send({ content: `查無資料!` });
        }
    },
} as Executor;