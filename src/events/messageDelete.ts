import Discord from "discord.js";
import auth from "../utils/auth";
   
import { EventType } from "../utils/types";
 

export = {
    name: "messageDelete",

    async execute(client: ZClient, message: Discord.Message) {
        if (message.webhookId) return;
        if (!message.guild) return;
        if (!auth.isAuthGuild(message.guild.id)) return;

        const fetchedLogs = await message.guild.fetchAuditLogs({
            limit: 6,
            type: Discord.AuditLogEvent.MessageDelete
        });

        const auditEntry = fetchedLogs.entries.find(e =>
            message.author && message.channel &&
            e.target.id === message.author.id &&
            e.extra.channel.id === message.channel.id &&
            Date.now() - e.createdTimestamp < 10000
        );

        if (auditEntry && auditEntry.executor && auditEntry.executor.id != client.user.id && message.author.id == client.user.id) {
            client.emit(EventType.eggsAppear, message, auditEntry.executor);
        }
    },
} as Executor;