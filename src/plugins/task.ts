import Discord from "discord.js";
import path from "path";
import tools from "../utils/tools";
   
 

function loadTasks(this: ZClient) {
    const dirPath = path.resolve(__dirname, `../tasks`);

    return tools.readDirAll(dirPath, (file) => {
        if (file.match(/(\.js|\.ts)$/)) {
            const task: Executor = require(file);
            if (task.name && task.interval) {
                this.tasks.set(task.name, task);
            }
        }
    });
}

function runTasks(this: ZClient) {
    this.tasks.forEach((task) => {
        setInterval(task.execute, task.interval, this);
    });
}

export function install(client: ZClient) {
    client.tasks = new Discord.Collection();

    client.loadTasks = loadTasks;
    client.runTasks = runTasks;
}