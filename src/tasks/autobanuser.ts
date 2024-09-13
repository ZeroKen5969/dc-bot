import tools from "../utils/tools";
import config from "../utils/config";
import blackListDao from "../database/blackListDao";
import teamMgr from "../firebase/teamMgr";
import crew from "../utils/crew";
 

export = {
    name: 'autobanuser',
    interval: 30 * 60 * 1000,

    async execute(client: ZClient) {
        const actions: Promise<Game.MemberInfo>[] = [];
        const members: Game.MemberFullInfo[] = [];

        const blackInfo = await blackListDao.getBlackInfo();

        for (const crewid of crew.crewids) {
            if (crew.exclude.includes(crewid)) continue;

            const SubscribeList = await teamMgr.getSubscribeListInfo(crewid);

            for (const userId in SubscribeList) {
                // 存在於團隊且在黑名單之中
                if (blackInfo.blackList[userId]) {
                    actions.push(teamMgr.kickMember(crewid, userId));
                    members.push({ crewid: crewid, id: userId, data: SubscribeList[userId] });
                }
            }
        }

        if (actions.length > 0) {
            const results = await Promise.all(actions);
            for (const cf of config.task.autobanuser) {
                const botSelf = client.getChannelInfo(cf.gid, cf.cid);
                await tools.sendMultiMessage(botSelf, results, "", 30, (_: Game.MemberInfo, idx: number) => {
                    const crew_member = members[idx];
                    const crewname = crew.crewidnames[crew_member.crewid];
                    return `\`${crewname}\` | 玩家\`${crew_member.data.Name} (${crew_member.id})\`已被自動剔除! (黑名單)\n`;
                });
            }
        }
    },
} as Executor;