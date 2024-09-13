import tools from "../../../utils/tools";
import bindingDao from "../../../database/bindingDao";
import teamMgr from "../../../firebase/teamMgr";
import moment from "../../../utils/moment";
import crew from "../../../utils/crew";
import { CmdType } from "../../../utils/types";
 

export = {
    name: 'indiscord',
    aliases: ["indc"],
    description: '檢查未加入DC的團隊成員',
    permissions: ["ManageGuild"],
    roles: [],
    type: [CmdType.Crew],
    // slash: {
    //     params: [],
    // },

    async execute(client: ZClient, msg: InteractionMessage, args: string[]) {
        const ret: Game.MemberFullInfo[] = [];
        const bindData = await bindingDao.findAll();
        const members = await msg.guild.members.fetch();

        for (const crewid of crew.crewids) {
            if (crew.exclude.includes(crewid)) continue;

            const SubscribeList = await teamMgr.getSubscribeListInfo(crewid);

            for (const info in SubscribeList) {
                const crew_member = SubscribeList[info];

                // 檢查是否曾經綁定
                const isChecked = await (async function () {
                    for (const dcKey in bindData) {
                        const bind_member = bindData[dcKey];
                        for (let i = 0; i < bind_member.accounts.length; ++i) {
                            if (info == bind_member.accounts[i]) {
                                // 曾經綁定時檢查此成員是否還在群內
                                const member = members.get(dcKey);

                                if (member) {
                                    return true;
                                }
                            }
                        }
                    }

                    return false;
                })();

                if (!isChecked) {
                    ret.push({ crewid: crewid, id: info, data: crew_member });
                }
            }
        }


        if (ret.length > 0) {
            const title = '======= 未入DC名單 =======\n';

            await tools.sendMultiMessage(msg, ret, title, 20, (data) => {
                const crewname = crew.crewidnames[data.crewid];
                const fakeId = data.id.substring(0, data.id.length / 2);
                const last = moment.tz(data.data.SignUpDate, 'MM/DD/YYYY hh:mm:ss a', 'Asia/Seoul');
                const curr = moment().utcOffset(9);
                const days = curr.diff(last, "days");

                return `\`${crewname}\` | Name: \`${data.data.Name}\`, Level: \`${data.data.Level + 1}\`, UUID: \`${fakeId}\`, 入團天數: \`${days}\`\n`;
            });
        } else {
            await msg.channel.send({ content: '查無資料!' });
        }
    },
} as Executor;