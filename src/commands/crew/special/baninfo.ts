import moment from "../../../utils/moment";
import tools from "../../../utils/tools";
import teamMgr from "../../../firebase/teamMgr";
import userMgr from "../../../firebase/userMgr";
import crew from "../../../utils/crew";
import { CmdType } from "../../../utils/types";
 

export = {
    name: 'baninfo',
    aliases: ['binfo'],
    description: '查詢封鎖訊息',
    permissions: [],
    roles: [],
    users: ["uid00", "uidzz"],
    dbAdmin: true,
    type: [CmdType.Crew],
    // slash: {
    //     params: []
    // },

    async execute(client: ZClient, msg: InteractionMessage, args: string[]) {
        let gameName = null;

        if (args.length >= 1) {
            gameName = args[0].toLowerCase();
        }

        const may: Game.MemberFullInfo[] = [];
        const actions: Promise<string>[] = [];
        const members: Game.MemberFullInfo[] = [];

        for (const crewid of crew.crewids) {
            const SubscribeList = await teamMgr.getSubscribeListInfo(crewid);

            for (const info in SubscribeList) {
                const crew_member = SubscribeList[info];
                const crew_member_name = crew_member.Name.toLowerCase();

                if (gameName) {
                    if (crew_member_name.includes(gameName) || gameName.includes(crew_member_name)) {
                        actions.push(userMgr.getBanInfo(info));
                        members.push({ crewid: crewid, id: info, data: crew_member });
                    }
                } else {
                    actions.push(userMgr.getBanInfo(info));
                    members.push({ crewid: crewid, id: info, data: crew_member });
                }
            }
        }

        await Promise.all(actions)
            .then((values) => {
                for (let i = 0; i < values.length; ++i) {
                    const res = values[i];

                    if (res) {
                        members[i].ban = res;
                        may.push(members[i]);
                    }
                }
            });

        if (may.length > 0) {
            const title = `🔎 被鎖帳成員`;

            let counter = 0;
            await tools.sendPrivateEmbedMultiMessage(msg, may, title, 10, (data: Game.MemberFullInfo) => {
                const last = moment.tz(data.data.LoginDate, 'MM/DD/YYYY hh:mm:ss a', 'Asia/Seoul');
                const curr = moment().utcOffset(9);
                const dateFmt = tools.timeFormat(curr.diff(last), true);

                const crewname = crew.crewidnames[data.crewid];

                return `${++counter}. \`${crewname}\` | 名稱: \`${data.data.Name}\` 等級: \`${data.data.Level + 1}\` ID: \`${data.id}\` 封鎖訊息: \`${data.ban}\` 最後上線: \`${dateFmt}\`\n\n`;
            });

        } else {
            await msg.author.send({ content: `查無資料!` });
        }

        await msg.channel.send({ content: `查詢完畢!` });
    },
} as Executor;