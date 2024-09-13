import tools from "../utils/tools";
import crewDao from "../database/crewDao";
import moment from "../utils/moment";
import config from "../utils/config";
import crew from "../utils/crew";
 

export = {
    name: "crewMemberNameChange",

    async execute(client: ZClient, event: CrewEventPack) {
        const msgBuf: string[] = [];

        const crewname = crew.crewidnames[event.cwid];

        if (event.member.Name) {
            msgBuf.push(`[BOT] \`${crewname}\` | 成員名稱更動 ${event.db_member.name} -> ${event.member.Name}`);

            await crewDao.changeMemberName(event.cwid, event.cmid, event.member.Name, moment().valueOf());

            for (const cf of config.event.crewMemberNameChange) {
                const botSelf = client.getChannelInfo(cf.gid, cf.cid);
                await tools.sendMultiMessage(botSelf, msgBuf, "", 30, (data: string) => {
                    return `${data}\n`;
                });
            }
        }
    }
} as Executor;