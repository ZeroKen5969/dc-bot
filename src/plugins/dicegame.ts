import * as fireAuth from "firebase/auth";
   
import { ChatClient } from "../photon/ChatClient";

function newMainChatClient(this: ZClient): ChatClient {
    return this.newChatClient(fireAuth.getAuth().currentUser.uid, true);
}

function newChatClient(this: ZClient, uuid: string, isMain: boolean = false): ChatClient {
    this.chatClients = this.chatClients || {};
    
    if (!this.chatClients[uuid]) {
        this.chatClients[uuid] = new ChatClient(this, uuid, isMain);
        this.chatClients[uuid].connectToServer();
    }

    return this.chatClients[uuid];
}

export function install(client: ZClient) {
    client.newChatClient = newChatClient;
    client.newMainChatClient = newMainChatClient;
}