import Discord from "discord.js";
import tools from "../../../utils/tools";
import bindingDao from "../../../database/bindingDao";
import teamMgr from "../../../firebase/teamMgr";
import crew from "../../../utils/crew";
import { CmdType } from "../../../utils/types";

export = {
    name: 'fastregister',
    aliases: ["fastreg"],
    description: '自動搜尋需綁定成員並綁定',
    permissions: ["ManageGuild"],
    roles: [],
    type: [CmdType.Crew],

    async execute(client: ZClient, msg: Discord.Message, args: string[]) {
        const bindData = await bindingDao.findAll();
        const members = await msg.guild.members.fetch();

        const may: Dict<Game.MemberFullInfo[]> = {};

        let allMembers: Game.MembersInfo = {};
        const crewMembers: Dict<Game.MembersInfo> = {};

        // 先找出成員集合
        for (const crewid of crew.crewids) {
            const SubscribeList = await teamMgr.getSubscribeListInfo(crewid);
            allMembers = { ...allMembers, ...SubscribeList };
            crewMembers[crewid] = SubscribeList;
        }

        // 找出未綁定的帳號
        const unbindMembers: Discord.GuildMember[] = tools.filtUnBindGuildMembers(members, bindData, allMembers);

        for (const crewid of crew.crewids) {
            const unbindCrewMembers: Game.MembersInfo = tools.filtUnBindCrewMembers(members, bindData, crewMembers[crewid]);

            // 查詢名稱相同成員
            for (const cmid in unbindCrewMembers) {
                const crew_member = unbindCrewMembers[cmid];
                const matchRes = unbindMembers.find((m) => {
                    const member_name = m.nickname || m.user.username;
                    return member_name == crew_member.Name;
                });

                if (matchRes) {
                    may[matchRes.id] = may[matchRes.id] || [];
                    may[matchRes.id].push({
                        crewid: crewid,
                        id: cmid,
                        data: crew_member
                    });
                }
            }

        }

        // 篩選結果
        const actions = [];
        const res: Game.MemberFullInfo[] = [];

        for (const dcid in may) {
            const matchMembers = may[dcid];

            if (matchMembers.length == 1) {
                const matchMem = matchMembers[0];
                res.push({
                    dcid: dcid,
                    crewid: matchMem.crewid,
                    id: matchMem.id,
                    data: matchMem.data
                });

                // 進行綁定
                bindData[dcid] = bindData[dcid] || {} as ZModel.Discord.BindData;
                bindData[dcid].userId = dcid;
                bindData[dcid].accounts = bindData[dcid].accounts || [];

                bindData[dcid].accounts.push(matchMem.id);
                actions.push(bindingDao.update(bindData[dcid]));
            }
        }

        if (res.length > 0) {
            await Promise.allSettled(actions);

            const title = `⚡ 快速綁定`;
            await tools.sendEmbedMultiMessage(msg, res, title, 10, (data: Game.MemberFullInfo) => {
                const fakeId = data.id.substring(0, data.id.length / 2);
                const crewname = crew.crewidnames[data.crewid];
                return `<@${data.dcid}> --> \`${crewname}\` | \`${data.data.Name}\` | \`${fakeId}\`\n`;
            });
        } else {
            await msg.channel.send({ content: `查無資料!` });
        }
    },
} as Executor;