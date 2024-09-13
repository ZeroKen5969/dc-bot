import Discord from "discord.js";
import auth from "../utils/auth";
import { EventType } from "../utils/types";
 
export = {
    name: "messageCreate",

    async execute(client: ZClient, message: Discord.Message) {
        if (message.webhookId) return;
        if (!message.channel.isDMBased() && !message.guild) return;
        if (!message.channel.isDMBased() && !auth.isAuthGuild(message.guild.id)) return;

        client.listens.forEach((exec) => {
            if (message.channel.isDMBased() && !exec.dm || !message.channel.isDMBased() && exec.dm) return;
            if (!message.channel.isDMBased() && !auth.hasCommmandAuth(message.member, exec)) return;
            if (!exec.bot && message.author.bot) return;

            let needListen = false;
            for (const channel of exec.listens) {
                if (message.channel.isThread()) {
                    if (message.channel.parentId == channel) {
                        needListen = true;
                        break;
                    }
                } else {
                    if (message.channel.id == channel) {
                        needListen = true;
                        break;
                    }
                }
            }

            if (!needListen) return;

            try {
                exec.execute(client, message);
            } catch (error) {
                console.error(error);
            }
        });

        let execed = false;
        let deleted = false;
        const lines = message.content.trim().split("\n");

        for (let i = 0; i < lines.length; ++i) {
            const line = lines[i];

            if (!line.startsWith(client.prefix)) continue;

            const [cmd, ...args] = line.slice(client.prefix.length).trimEnd().split(/\s+/);

            const exec = client.commands.get(cmd) || client.aliases.get(cmd);

            if (!exec) continue;

            if (!exec.bot && message.author.bot) continue;

            if (message.channel.isDMBased() && !exec.dm || !message.channel.isDMBased() && exec.dm) continue;

            if (!message.channel.isDMBased() && auth.isOnlyAuthMusicGuild(message.guild.id) && !auth.isOnlyAuthMusicCommand(exec)) continue;

            if (!message.channel.isDMBased() && !auth.isAuthChannel(message, exec)) continue;

            if (!auth.hasCommmandAuth(exec.dm ? message.author : message.member, exec)) continue;

            if (exec.delete && !deleted && message.deletable) deleted = !!await message.delete();

            if (!client.coolDownExpired(message, exec)) continue;

            try {
                execed = true;
                exec.execute(client, message, args);
            } catch (error) {
                console.error(error);
            }

            client.updateCoolDown(message, exec);
        }

        if (!execed && !message.author.bot) {
            client.emit(EventType.eggsAppear, message);
        }
    },
} as Executor;