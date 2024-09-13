import Discord from "discord.js";
import tools from "../../../utils/tools";
import bindingDao from "../../../database/bindingDao";
import teamMgr from "../../../firebase/teamMgr";
import userMgr from "../../../firebase/userMgr";
import crew from "../../../utils/crew";
import { CmdType } from "../../../utils/types";
 

export = {
    name: 'report',
    aliases: ["rp"],
    description: '查詢檢舉數量',
    permissions: [],
    roles: [],
    cooldown: {
        ManageGuild: 0,
        Default: 6 * 60 * 60 * 1000,
    },
    channels: {
        ManageGuild: [],
        Default: ["901317770749280266"]
    },
    type: [CmdType.Crew],

    async execute(client: ZClient, msg: Discord.Message, args: string[]) {

        let target = null;
        if (msg.member.permissions.has(Discord.PermissionFlagsBits.ManageGuild)) {
            if (args.length > 0) {
                target = tools.pickUserId(args[0]);
            }
        }

        const dcId = target || msg.member.id;

        const actions = [];
        const users = [];

        const data = await bindingDao.find(dcId);
        for (const crewid of crew.crewids) {
            const SubscribeList = await teamMgr.getSubscribeListInfo(crewid);
            data.accounts.forEach(uuid => {
                const crew_member = SubscribeList[uuid];
                if (crew_member) {
                    actions.push(userMgr.getReportInfo(uuid));
                    users.push({ crewid: crewid, uuid: uuid, info: crew_member });
                }
            });
        }


        const res = await Promise.all(actions);

        for (let i = 0; i < res.length; ++i) {
            users[i].report = res[i];
        }

        if (users.length > 0) {
            const title = `🔎 檢舉次數`;

            let counter = 0;
            await tools.sendEmbedMultiMessage(msg, users, title, 10, (data) => {
                return `${++counter}. 名稱: \`${data.info.Name}\` 檢舉: \`${data.report}\`\n\n`;
            });
        } else {
            await msg.channel.send({ content: `<@${dcId}> 查無資料!` });
        }
    },
} as Executor;