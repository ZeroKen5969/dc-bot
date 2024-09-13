import Discord from "discord.js";
   
 

export = {
    name: "crewRoleChange",

    async execute(client: ZClient, member: Discord.GuildMember, crid: string, wearStatus: boolean) {
        if (wearStatus) {
            await member.roles.add(crid);
        } else {
            await member.roles.remove(crid);
        }
    }
} as Executor;