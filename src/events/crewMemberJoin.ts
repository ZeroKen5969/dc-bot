import tools from "../utils/tools";
import crewDao from "../database/crewDao";
import moment from "../utils/moment";
import config from "../utils/config";
import teamMgr from "../firebase/teamMgr";
import crew from "../utils/crew";
 

export = {
    name: "crewMemberJoin",

    async execute(client: ZClient, event: CrewEventPack, isNewMember: boolean) {
        const msgBuf: string[] = [];

        const crewname = crew.crewidnames[event.cwid];

        if (event.member.Name) {
            const joinCount = (!event.memberRecord || !event.memberRecord.joinHistory ? 0 : event.memberRecord.joinHistory.length) + 1;
            msgBuf.push(`[BOT] \`${crewname}\` | ${isNewMember ? "新" : ""}玩家入團 ${event.member.Name} ${event.cmid}, 入團次數: ${joinCount}`);
            await crewDao.joinMember(event.cwid, event.cmid, event.member.Name, moment().valueOf(), isNewMember);
        } else {
            msgBuf.push(`[BOT] \`${crewname}\` | ${isNewMember ? "新" : ""}玩家入團 (此玩家資料格式錯誤) ${event.cmid}, 已自動移除!`);
            await teamMgr.kickMember(event.cwid, event.cmid);
        }

        for (const cf of config.event.crewMemberJoin) {
            const botSelf = client.getChannelInfo(cf.gid, cf.cid);
            await tools.sendMultiMessage(botSelf, msgBuf, "", 30, (data: string) => {
                return `${data}\n`;
            });
        }
    }
} as Executor;