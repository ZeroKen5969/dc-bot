import Discord from "discord.js";
import tools from "./tools";

import { CmdType } from "../utils/types";

export default {
    AuthGuilds: ["gid00", "gid11", "gid22", "gid33", "gid44"],
    AuthMusicGuilds: ["gid22", "gid44"],

    hasCommmandAuth(member: Discord.User | Discord.GuildMember, exec: Executor): boolean {
        let isAuth =
            (!exec.permissions || exec.permissions.length <= 0) &&
            (!exec.roles || exec.roles.length <= 0) &&
            (!exec.users || exec.users.length <= 0);

        if (member instanceof Discord.GuildMember && exec.permissions) {
            for (const perm of exec.permissions) {
                if (member.permissions.has(Discord.PermissionFlagsBits[perm])) {
                    isAuth = true;
                    break;
                }
            }
        }

        if (member instanceof Discord.GuildMember && exec.roles) {
            for (const role of exec.roles) {
                if (member.roles.cache.has(role)) {
                    isAuth = true;
                    break;
                }
            }
        }

        if (exec.users) {
            for (const user of exec.users) {
                if (member.id == user) {
                    isAuth = true;
                    break;
                }
            }
        }

        if (member instanceof Discord.GuildMember && isAuth && exec.dbAdmin) {
            isAuth = member.permissions.has(Discord.PermissionFlagsBits.ManageGuild);
        }

        return isAuth;
    },

    isFriendUser(member: Discord.GuildMember): boolean {
        return [
        ].includes(member.user.id);
    },

    isSpecUser(member: Discord.GuildMember): boolean {
        return [
        ].includes(member.user.id);
    },

    hasSpecAuth(member: Discord.GuildMember): boolean {
        return member.roles.cache.hasAny(...[
        ]);
    },

    isSpecCrewUser(id: string): boolean {
        return [
        ].includes(id);
    },

    isAuthGuild(id: string): boolean {
        return this.AuthGuilds.includes(id);
    },

    isOnlyAuthMusicGuild(id: string): boolean {
        return this.AuthMusicGuilds.includes(id);
    },

    isOnlyAuthMusicCommand(exec: Executor): boolean {
        return exec.type && (exec.type.includes(CmdType.Music) || exec.type.includes(CmdType.Universal));
    },

    isAuthChannel(msg: Discord.Message, exec: Executor): boolean {
        const channels = tools.getChannelConfig(msg, exec);
        return !channels || channels.length <= 0 || channels.includes(msg.channel.id);
    },
};
