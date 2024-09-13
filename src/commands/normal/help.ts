import Discord from "discord.js";
import auth from "../../utils/auth";
import tools from "../../utils/tools";
  
import { CmdType, CmdTypeName } from "../../utils/types";
 

export = {
    name: 'help',
    aliases: ["h"],
    description: '取得命令說明',
    permissions: [],
    roles: [],
    type: [CmdType.Universal],

    async execute(client: ZClient, msg: Discord.Message, args: string[]) {
        const menu = new Discord.SelectMenuBuilder()
            .setCustomId("menu")
            .setMinValues(1)
            .setMaxValues(1);

        for (const cKey in CmdType) {
            const cType = CmdType[cKey];
            menu.addOptions({
                label: CmdTypeName[cType],
                value: cType
            });
        }

        const comps = new Discord.ActionRowBuilder<Discord.SelectMenuBuilder>()
            .addComponents(menu);

        const num = 1;
        const interMsg = await msg.channel.send({ content: "**選擇一個類別**", components: [comps] });

        let cmdKey: string = await new Promise<string>((resolve, reject) => {
            const collector = interMsg.createMessageComponentCollector({
                max: num,
                time: 60 * 1000,
                filter(m: Discord.Interaction): boolean {
                    return m.user.id == msg.author.id && m.isSelectMenu();
                }
            });

            collector.on("collect", (inter: Discord.SelectMenuInteraction) => {
                inter.deferUpdate();
            });

            collector.on("end", (collected: Discord.Collection<string, Discord.SelectMenuInteraction>, reason: string) => {
                interMsg.delete().then(() => {
                    if (collected.size >= num) {
                        const m = collected.first();
                        resolve(m.values[0]);
                    } else {
                        reject(`${this.name}命令超時未有資料`);
                    }
                });
            });
        });

        cmdKey = cmdKey == CmdType.All ? null : cmdKey;

        const msgs = [];

        client.commands.forEach((command) => {
            if (command.hide) return;
            if (auth.isOnlyAuthMusicGuild(msg.guild.id) && !auth.isOnlyAuthMusicCommand(command)) return;
            if (cmdKey && (!command.type || !command.type.includes(cmdKey))) return;
            if (!auth.hasCommmandAuth(msg.member, command)) return;

            let tmp = `- ${command.name}`;
            if (command.aliases) {
                command.aliases.forEach((alias) => {
                    tmp += `, ${alias}`;
                });
            }

            tmp += `\n\`${command.description || "暫無說明"}\``;

            if (command.example) {
                tmp += `\n__ex: ${client.prefix}${command.example}__`;
            }

            tmp += "\n";

            msgs.push(tmp);
        });

        if (msgs.length > 0) {
            const title = ":spy: 指令說明";

            await tools.sendEmbedMultiMessage(msg, msgs, title, 15, (data) => {
                return `${data}\n`;
            });
        } else {
            await msg.channel.send({ content: '查無資料!' });
        }
    },
} as Executor;