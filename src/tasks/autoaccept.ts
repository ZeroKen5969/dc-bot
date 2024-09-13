import tools from "../utils/tools";
import config from "../utils/config";
import blackListDao from "../database/blackListDao";
import teamMgr from "../firebase/teamMgr";
import crew from "../utils/crew";
import anyCrewDao from "../database/anyCrewDao";
 

export = {
    name: 'autoaccept',
    interval: 10 * 60 * 1000,

    async execute(client: ZClient) {

        const may: Game.MemberFullInfo[] = [];

        const acptStatus = await anyCrewDao.getAllAutoAcceptStatus();

        for (const crewid of crew.crewids) {
            if (!acptStatus[crewid]) continue;

            const SignUpList = await teamMgr.getSignInfo(crewid);

            for (const info in SignUpList) {
                const signup_member = SignUpList[info];
                may.push({ crewid: crewid, id: info, data: signup_member });
            }
        }

        if (may.length > 0) {
            const msgBuf: string[] = [];

            const blackInfo = await blackListDao.getBlackInfo();

            for (let i = 0; i < may.length; ++i) {
                const gameId = may[i].id;
                const crewid = may[i].crewid;
                const crewname = crew.crewidnames[crewid];

                if (!crew.exclude.includes(crewid) && blackInfo.blackList[gameId]) {
                    await teamMgr.acceptSign(crewid, gameId, 2);
                    msgBuf.push(`[BOT] \`${crewname}\` | 已拒絕玩家\`${may[i].data.Name} (${gameId})\`申請! (玩家在黑名單之中)`);
                } else {
                    const result = await teamMgr.acceptSign(crewid, gameId, 1);

                    if (result == null) {
                        msgBuf.push(`[BOT] \`${crewname}\` | 玩家\`${may[i].data.Name} (${gameId})\`已取消申請!`);
                    } else if (result == 1) {
                        msgBuf.push(`[BOT] \`${crewname}\` | 已接受玩家\`${may[i].data.Name} (${gameId})\`申請!`);
                    } else if (result == 2) {
                        msgBuf.push(`[BOT] \`${crewname}\` | 已拒絕玩家\`${may[i].data.Name} (${gameId})\`申請!`);
                    } else {
                        msgBuf.push(`[BOT] \`${crewname}\` | 未處理玩家\`${may[i].data.Name} (${gameId})\`申請!`);
                    }
                }
            }

            for (const cf of config.task.autoaccept) {
                const botSelf = client.getChannelInfo(cf.gid, cf.cid);
                await tools.sendMultiMessage(botSelf, msgBuf, "", 30, (data: string) => {
                    return `${data}\n`;
                });
            }
        }
    },
} as Executor;
