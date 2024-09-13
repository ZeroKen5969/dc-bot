import Discord from "discord.js";
import teamMgr from "../firebase/teamMgr";
import bindingDao from "../database/bindingDao";
import crew from "../utils/crew";
import tools from "../utils/tools";
import userMgr from "../firebase/userMgr";
import config from "../utils/config";

export = {
    name: 'crewchecker',
    interval: 30 * 60 * 1000,

    async execute(client: ZClient) {
        const guild = client.guilds.cache.get(client.mainGuild);
        const guildMembers = await guild.members.fetch();

        const cfg = config.task.crewchecker;

        const members = guildMembers.filter((m) => {
            return !m.user.bot && !m.permissions.has(Discord.PermissionFlagsBits.ManageGuild) && m.roles.cache.hasAny(...cfg.all);
        });
        const bindData = await bindingDao.findAll();

        let allMembers: Game.MembersInfo = {};

        for (const crewid of crew.crewids) {
            const SubscribeList = await teamMgr.getSubscribeListInfo(crewid);
            allMembers = { ...allMembers, ...SubscribeList };
        }

        const unBinds = tools.filtUnBindGuildMembers(members, bindData, allMembers);

        const unJoins: Dict<Discord.GuildMember> = {};
        const others: Dict<Discord.GuildMember> = {};

        const checkAction = async function (m: Discord.GuildMember, binding: ZModel.Discord.BindData) {
            let isOther = false;

            for (const cmid of binding.accounts) {
                const cwid = await userMgr.getTeam(cmid);
                if (cwid && !crew.historys.includes(cwid)) {
                    isOther = true;
                    break;
                }
            }

            if (isOther) {
                others[m.id] = m;
            } else {
                unJoins[m.id] = m;
            }
        };

        const actions = [];

        for (const m of unBinds) {
            const binding = bindData[m.id];
            if (binding) {
                actions.push(checkAction(m, binding));
            }
        }

        await Promise.all(actions);

        for (const [_, dc_member] of members) {
            let needRoles = cfg.self;
            let allRoles = cfg.all;

            if (unJoins[dc_member.id]) {
                needRoles = cfg.unJoin;
            } else if (others[dc_member.id]) {
                needRoles = cfg.other;
                continue;
            }

            for (const rid of needRoles) {
                if (!dc_member.roles.cache.get(rid)) { // 團員
                    await dc_member.roles.add(rid);
                }

                if (cfg.specDiffRole[rid]) {
                    for (const diffRid of cfg.specDiffRole[rid]) {
                        if (dc_member.roles.cache.get(diffRid)) { // 團員
                            await dc_member.roles.remove(diffRid);
                        }
                    }
                }
            }

            for (const rid of allRoles) {
                if (!needRoles.includes(rid) && dc_member.roles.cache.get(rid)) {
                    await dc_member.roles.remove(rid);
                }
            }
        }
    },
} as Executor;
