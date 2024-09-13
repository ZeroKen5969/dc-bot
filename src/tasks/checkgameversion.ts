import userMgr from "../firebase/userMgr";
   
 

export = {
    name: 'checkgameversion',
    interval: 5 * 60 * 1000,

    async execute(client: ZClient) {
        const gInfo = await userMgr.getGameBaseInfo();
        for (const uuid in client.chatClients) {
            // client.chatClients[uuid].setAppVersion(gInfo.vAOS);
        }
    },
} as Executor;