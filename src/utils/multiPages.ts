import Discord from "discord.js";

const prevBtn = '⬅️';
const stopBtn = "⏹️";
const nextBtn = '➡️';
const btnTable = [prevBtn, stopBtn, nextBtn];

function reactionfilterCreator(fromMsg: InteractionMessage): (reaction: Discord.MessageReaction, user: Discord.User) => boolean {
    return (reaction, user) => !user.bot && btnTable.includes(reaction.emoji.name) && fromMsg.author.id == user.id;
}

function msgfilterCreator(fromMsg: InteractionMessage): (message: Discord.Message) => boolean {
    return (message) => !message.author.bot && fromMsg.author.id == message.author.id;
}

function createCollectorMessage(
    fromMsg: InteractionMessage,
    message: Discord.Message,
    pages: Discord.EmbedBuilder[],
    time: number,
    reationOption?: ReactionOption): void {

    reationOption = reationOption || {};
    reationOption.filter = reationOption.filter || reactionfilterCreator(fromMsg);
    reationOption.time = reationOption.time || time;

    let endFlag = false;
    let i = 0;

    const reactionCollector = message.createReactionCollector(reationOption);

    reactionCollector.on('collect', (reaction, user) => {
        reaction.users.remove(user.id);

        if (reaction.emoji.name == stopBtn) {
            reactionCollector.stop();
        } else {
            if (reaction.emoji.name == prevBtn) {
                --i;
            } else if (reaction.emoji.name == nextBtn) {
                ++i;
            }

            i = (i % pages.length + pages.length) % pages.length;

            message.edit({ embeds: [pages[i]] });
        }
    });

    reactionCollector.on('end', (collected) => {
        endFlag = true;
        message.reactions.removeAll();
    });

    message.react(prevBtn)
        .then(msgReaction => {
            if (msgReaction && !endFlag) {
                return msgReaction.message.react(stopBtn);
            }
        })
        .then(msgReaction => {
            if (msgReaction && !endFlag) {
                return msgReaction.message.react(nextBtn);
            }
        });
}

function createCollectorInputMessage(
    fromMsg: InteractionMessage,
    message: Discord.Message,
    pages: Discord.EmbedBuilder[],
    time: number,
    reationOption?: ReactionOption,
    msgOption?: MessageOption): void {

    reationOption = reationOption || {};
    reationOption.filter = reationOption.filter || reactionfilterCreator(fromMsg);
    reationOption.time = reationOption.time || time;

    msgOption = msgOption || {};
    msgOption.filter = msgOption.filter || msgfilterCreator(fromMsg);
    msgOption.max = msgOption.max || 1;
    msgOption.time = msgOption.time || time;

    let endFlag = false;

    const msgCollector = message.channel.createMessageCollector(msgOption);
    const reactionCollector = message.createReactionCollector(reationOption);

    msgCollector.on('end', (collected, reason) => {
        if (collected.size >= msgOption.max && msgOption.end) {
            msgOption.end(collected);
        }

        endFlag = true;
        reactionCollector.stop();
    });

    let i = 0;
    reactionCollector.on('collect', (reaction, user) => {
        reaction.users.remove(user.id);

        if (reaction.emoji.name == stopBtn) {
            msgCollector.stop();
            reactionCollector.stop();
        } else {
            if (reaction.emoji.name == prevBtn) {
                --i;
            } else if (reaction.emoji.name == nextBtn) {
                ++i;
            }

            i = (i % pages.length + pages.length) % pages.length;

            message.edit({ embeds: [pages[i]] });
        }
    });

    reactionCollector.on('end', (collected, reason) => {
        endFlag = true;
        message.reactions.removeAll();
    });


    message.react(prevBtn)
        .then(msgReaction => {
            if (msgReaction && !endFlag) {
                return msgReaction.message.react(stopBtn);
            }
        })
        .then(msgReaction => {
            if (msgReaction && !endFlag) {
                return msgReaction.message.react(nextBtn);
            }
        });
}

async function sendMultiPages(
    message: InteractionMessage,
    pages: Discord.EmbedBuilder[],
    time: number,
    reationOption?: ReactionOption): Promise<void> {

    await message.channel.send({ embeds: [pages[0]] })
        .then(msg => createCollectorMessage(message, msg, pages, time, reationOption));
}

async function sendInputMultiPages(
    message: InteractionMessage,
    pages: Discord.EmbedBuilder[],
    time: number,
    reationOption?: ReactionOption,
    msgOption?: MessageOption): Promise<void> {

    await message.channel.send({ embeds: [pages[0]] })
        .then(msg => createCollectorInputMessage(message, msg, pages, time, reationOption, msgOption));
}

async function sendPrivateMultiPages(
    message: InteractionMessage,
    pages: Discord.EmbedBuilder[],
    time: number,
    reationOption?: ReactionOption): Promise<void> {

    await message.author.send({ embeds: [pages[0]] })
        .then(msg => createCollectorMessage(message, msg, pages, time, reationOption));
}

async function sendPrivateInputMultiPages(
    message: InteractionMessage,
    pages: Discord.EmbedBuilder[],
    time: number,
    reationOption?: ReactionOption,
    msgOption?: MessageOption): Promise<void> {

    return await message.author.send({ embeds: [pages[0]] })
        .then(msg => createCollectorInputMessage(message, msg, pages, time, reationOption, msgOption));
}

export default {
    prevBtn: prevBtn,
    stopBtn: stopBtn,
    nextBtn: nextBtn,
    btnTable: btnTable,
    sendMultiPages: sendMultiPages,
    sendPrivateMultiPages: sendPrivateMultiPages,
    sendInputMultiPages: sendInputMultiPages,
    sendPrivateInputMultiPages: sendPrivateInputMultiPages,
};