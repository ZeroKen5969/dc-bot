import tools from "../utils/tools";
import crewDao from "../database/crewDao";
import config from "../utils/config";
import crew from "../utils/crew";
 

export = {
    name: "crewMemberLeave",

    async execute(client: ZClient, event: CrewEventPack) {
        const msgBuf: string[] = [];

        const crewname = crew.crewidnames[event.cwid];

        if (event.db_member.name) {
            msgBuf.push(`[BOT] \`${crewname}\` | 玩家離團 ${event.db_member.name} ${event.cmid}`);
        } else {
            msgBuf.push(`[BOT] \`${crewname}\` | 玩家離團 (此玩家資料格式錯誤) ${event.cmid}`);
        }

        await crewDao.leaveMember(event.cwid, event.cmid);

        for (const cf of config.event.crewMemberLeave) {
            const botSelf = client.getChannelInfo(cf.gid, cf.cid);
            await tools.sendMultiMessage(botSelf, msgBuf, "", 30, (data: string) => {
                return `${data}\n`;
            });
        }
    }
} as Executor;