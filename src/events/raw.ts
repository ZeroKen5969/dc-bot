import auth from "../utils/auth";
   
 

export = {
    name: "raw",

    async execute(client: ZClient, packet: any, id: number) {
        if (packet.d && !auth.isAuthGuild(packet.d.guild_id)) return;
    },
} as Executor;