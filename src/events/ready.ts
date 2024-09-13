import userMgr from "../firebase/userMgr";
import config from "../utils/config";
   
 

export = {
    name: "ready",
    once: true,

    execute(client: ZClient) {
        console.log(`Logged in as ${client.user.tag}!`);

        client.runTasks();
        client.loadMessages();
        client.registerSlashCommands();

        // client.newMainChatClient();
    },
} as Executor;
