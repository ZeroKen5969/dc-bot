import Discord from "discord.js";
import fs from "fs";
import dbMgr from "./database/dbMgr";
import firebaseMgr from "./firebase/firebaseMgr";
import tools from "./utils/tools";

process.on('uncaughtException', (err, origin) => {
    console.error("uncaughtException", err, err.stack);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error("unhandledRejection", reason);
});

const client = new Discord.Client({
    intents: tools.expandEnumValues(Discord.GatewayIntentBits) as number[],
    partials: tools.expandEnumValues(Discord.Partials) as number[],
}) as ZClient;

const pluginDir = `${__dirname}/plugins`;

fs.readdirSync(pluginDir)
    .filter(file => file.match(/(\.js|\.ts)$/))
    .forEach((file) => {
        const plugin: Installer = require(`${pluginDir}/${file}`);
        plugin.install(client);
    });

Promise.all([
    dbMgr.connectAll(),
    firebaseMgr.firebase.loginWithFile(),
    client.loadTasks(),
    client.loadCommands(),
    client.loadEvents(),
]).then((result) => {
    client.login(process.env.BOT_TOKEN);
}).catch(console.error);