import Discord from "discord.js";
import teamMgr from "../firebase/teamMgr";
import bindingDao from "../database/bindingDao";
import crew from "../utils/crew";
import config from "../utils/config";
   
 

export = {
    name: 'crewraidchecker',
    interval: 30 * 60 * 1000,

    async execute(client: ZClient) {
        const raidInfos = await teamMgr.getCrewRaidInfo(crew.main);
        if (!raidInfos) return;

        const cfg = config.task.crewraidchecker;

        const guild = client.guilds.cache.get(client.mainGuild);
        const allMembers = await guild.members.fetch();

        const meowMembers = allMembers.filter((m) => {
            return !m.user.bot && !m.permissions.has(Discord.PermissionFlagsBits.ManageGuild) && m.roles.cache.has(cfg.meow);
        });

        const bindData = await bindingDao.findAll();
        const subscribeList = await teamMgr.getSubscribeListInfo(crew.main);

        for (const [_, dc_member] of meowMembers) {
            let haveRecord = false;

            const binding = bindData[dc_member.id];
            for (const cmid of binding.accounts) {
                if (subscribeList[cmid] && raidInfos[cmid] && raidInfos[cmid].Score && Object.values(raidInfos[cmid].Score).length) {
                    haveRecord = true;
                    break;
                }
            }

            if (!haveRecord) {
                if (!dc_member.roles.cache.get(cfg.badMeow)) {
                    await dc_member.roles.add(cfg.badMeow);
                }
            } else {
                if (dc_member.roles.cache.get(cfg.badMeow)) {
                    await dc_member.roles.remove(cfg.badMeow);
                }
            }
        }

        const otherMembers = allMembers.filter((m) => {
            return !m.user.bot && !m.permissions.has(Discord.PermissionFlagsBits.ManageGuild) && !m.roles.cache.has(cfg.meow);
        });

        for (const [_, dc_member] of otherMembers) {
            if (dc_member.roles.cache.get(cfg.badMeow)) {
                await dc_member.roles.remove(cfg.badMeow);
            }
        }
    },
} as Executor;