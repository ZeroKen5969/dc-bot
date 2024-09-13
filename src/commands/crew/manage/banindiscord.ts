import Discord from "discord.js";
import tools from "../../../utils/tools";
import moment from "../../../utils/moment";
import bindingDao from "../../../database/bindingDao";
import teamMgr from "../../../firebase/teamMgr";
import crew from "../../../utils/crew";
import { CmdType } from "../../../utils/types";
 

export = {
    name: 'banindiscord',
    aliases: ["banindc"],
    description: '封鎖未加入DC的團隊成員',
    permissions: ["ManageGuild"],
    roles: [],
    type: [CmdType.Crew],

    async execute(client: ZClient, msg: Discord.Message, args: string[]) {
        const members = await msg.guild.members.fetch();
        const bindData = await bindingDao.findAll();

        const actions: Promise<Game.MemberInfo>[] = [];
        const infos: Game.MemberFullInfo[] = [];

        for (const crewid of crew.crewids) {
            if (crew.exclude.includes(crewid)) continue;

            const SubscribeList = await teamMgr.getSubscribeListInfo(crewid);

            for (const info in SubscribeList) {

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
                    const last = moment.tz(SubscribeList[info].SignUpDate, 'MM/DD/YYYY hh:mm:ss a', 'Asia/Seoul');
                    const curr = moment().utcOffset(9);

                    if (curr.diff(last, "days") >= 2) {
                        actions.push(teamMgr.kickMember(crewid, info));
                        infos.push({ crewid: crewid, id: info, data: SubscribeList[info] });
                    }
                }
            }
        }

        if (actions.length > 0) {
            await Promise.all(actions).then((results) => {
                tools.sendEmbedMultiMessage(msg, results, "被剔除成員 (入團超過兩天)", 30, (crew_member: Game.MemberInfo, idx: number) => {
                    const info = infos[idx];
                    const crewname = crew.crewidnames[info.crewid];
                    const last = moment.tz(crew_member.SignUpDate, 'MM/DD/YYYY hh:mm:ss a', 'Asia/Seoul');
                    const curr = moment().utcOffset(9);
                    const days = curr.diff(last, "days");

                    return `\`${crewname}\` | 玩家\`${crew_member.Name} (${info.id})\`已被剔除! (${days}天)\n`;
                });
            });
        } else {
            await msg.channel.send({ content: `查無資料!` });
        }
    },
} as Executor;