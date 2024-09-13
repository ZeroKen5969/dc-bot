import Discord from "discord.js";
import auth from "../utils/auth";
 

export = {
    name: "interactionCreate",

    async execute(client: ZClient, interaction: ZInteraction) {
        if (!interaction.isChatInputCommand()) return;

        const exec = client.slashes.get(interaction.commandName) && client.commands.get(interaction.commandName);

        if (!exec) return;

        interaction.member = interaction.guild.members.cache.get(interaction.member.user.id);
        interaction.author = interaction.member && interaction.member.user;

        if (!auth.hasCommmandAuth(interaction.member, exec)) return;

        try {
            const args = interaction.options.data.map((e) => {
                switch (e.type) {
                    case Discord.ApplicationCommandOptionType.User:
                        return e.user.toString();
                    default:
                        return e.value;
                }
            });

            await interaction.deferReply();

            exec.execute(client, interaction, args);

            await interaction.deleteReply();
        } catch (error) {
            console.error(error);
        }
    },
} as Executor;