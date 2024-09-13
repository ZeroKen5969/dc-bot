import Discord from "discord.js";
import path from "path";
import tools from "../utils/tools";
import auth from "../utils/auth";
   
 

function loadCommands(this: ZClient) {
    const dirPath = path.resolve(__dirname, `../commands`);

    return tools.readDirAll(dirPath, (file) => {
        if (file.match(/(\.js|\.ts)$/)) {
            const command: Executor = require(file);
            const slashCmd = toSlashCommand(command);

            if (slashCmd) {
                this.slashes.set(slashCmd.name, slashCmd);
            }

            if (command.aliases) {
                command.aliases.forEach(alias => {
                    this.aliases.set(alias, command);
                });
            }

            if (command.name) {
                if (command.listens && command.listens.length > 0) {
                    this.listens.set(command.name, command);
                } else {
                    this.commands.set(command.name, command);
                }
            }
        }
    });
}

async function registerSlashCommands(this: ZClient): Promise<void> {
    const slashes = this.slashes.map(exec => exec);
    for (let i = 0; i < auth.AuthGuilds.length; ++i) {
        if (auth.AuthMusicGuilds.includes(auth.AuthGuilds[i])) continue;
        await this.rest.put(
            Discord.Routes.applicationGuildCommands(this.user.id, auth.AuthGuilds[i]),
            {
                body: slashes
            }
        );
    }
}

function toSlashCommand(exec: Executor): Discord.SlashCommandBuilder {
    if (!exec.name || !exec.slash) return null;

    const slashCmd = new Discord.SlashCommandBuilder()
        .setName(exec.name)
        .setDescription(exec.description);

    if (exec.permissions && exec.permissions.length ||
        exec.users && exec.users.length ||
        exec.roles && exec.roles.length) {

        const perm = exec.permissions ? exec.permissions.reduce((flag, e) => flag | Discord.PermissionFlagsBits[e], 0n) : 0;
        slashCmd.setDefaultMemberPermissions(perm);
    }

    if (exec.slash.params) {
        for (let i = 0; i < exec.slash.params.length; ++i) {
            const param = exec.slash.params[i];

            const optAction = <T extends Discord.ApplicationCommandOptionBase>(option: T) => {
                option
                    .setName(param.name)
                    .setDescription(param.description || param.name)
                    .setRequired(true);

                return option;
            };

            switch (param.type) {
                case Discord.ApplicationCommandOptionType.User:
                    slashCmd.addUserOption(optAction);
                    break;
                default:
                    slashCmd.addStringOption(optAction);
            }
        }
    }

    return slashCmd;
}

export function install(client: ZClient) {
    client.commands = new Discord.Collection();
    client.slashes = new Discord.Collection();
    client.aliases = new Discord.Collection();
    client.listens = new Discord.Collection();

    client.loadCommands = loadCommands;
    client.registerSlashCommands = registerSlashCommands;
}