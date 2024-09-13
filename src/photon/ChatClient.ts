import "./lib/Photon-Javascript_SDK";
import { EventEmitter } from "events";
import { EventType } from "../utils/types";

enum SubscribeStatus {
    Subscribed = 1,
    Subscripting = 2,
}

export class ChatClient extends Photon.Chat.ChatClient {
    
    private eventBase: EventEmitter;
    private uuid: string;
    private msgQueue: Game.PublishedMessage[];
    private subscriptChannels: Dict<SubscribeStatus>;
    private isMainClient: boolean;

    constructor(eventBase: EventEmitter, uuid: string, isMainClient: boolean = false) {
        const AppId = process.env.AppIdChat;
        const VersionName = process.env.GameVersion;
        const AppVersion = VersionName.substring(0, VersionName.lastIndexOf("."));

        super(Photon.ConnectionProtocol.Wss, AppId, AppVersion);

        this.eventBase = eventBase;
        this.uuid = uuid;
        this.msgQueue = [];
        this.subscriptChannels = {};
        this.isMainClient = isMainClient;

        // this.logger.setLevel(Exitgames.Common.Logger.Level.ERROR);

        setInterval(() => {
            if (this.state != Photon.Chat.ChatClient.ChatState.ConnectedToFrontEnd) return;
            
            const channels = this.getPublicChannels();
            const completed: Game.PublishedMessage[] = [];
            for (const msg of this.msgQueue) {
                if (channels[msg.channel]) {
                    if (this.publishMessage(msg.channel, msg.content)) {
                        completed.push(msg);
                    }
                } else {
                    this.subscribe([msg.channel], {
                        historyLength: 0,
                    });
                }
            }
            this.msgQueue = this.msgQueue.filter((m) => !completed.includes(m));
        }, 1000);
        // this.DefaultMaxSubscribers = 1000;
    }

    // logger = new Exitgames.Common.Logger("Demo:", DemoConstants.LogLevel);

    onError(errorCode: number, errorMsg: string) {
        console.log("Error:", errorCode, errorMsg);
    }

    onStateChange(state: number) {
        console.log("onStateChange", Photon.Chat.ChatClient.StateToName(state));

        switch (state) {
            case Photon.Chat.ChatClient.ChatState.ConnectingToNameServer:
                break;
            case Photon.Chat.ChatClient.ChatState.ConnectedToNameServer:
                this.getRegions();
                break;
            case Photon.Chat.ChatClient.ChatState.ConnectingToFrontEnd:
                break;
            case Photon.Chat.ChatClient.ChatState.ConnectedToFrontEnd:
                // console.log(this.setUserStatus(Photon.Chat.Constants.UserStatus.Online));
                if (this.isMainClient) {
                    this.subscribe([
                        "040",
                        "crewid11"
                        // "cwid",
                    ], {
                        historyLength: 0,
                    });
                }
                break;
        }
    }

    pushMessage(message: Game.PublishedMessage) {
        this.msgQueue.push(message);
    }

    subscribe(channelNames: string[], options?: {
        historyLength?: number;
        lastIds?: number[];
        createOptions?: {
            publishSubscribers: boolean;
            maxSubscribers: number;
        };
    }): boolean {
        channelNames = channelNames.filter((channel) => {
            return !this.subscriptChannels[channel];
        });

        channelNames.forEach((channel) => {
            this.subscriptChannels[channel] = SubscribeStatus.Subscripting;
        });

        return super.subscribe(channelNames, options);
    }

    onChatMessages(channelName: string, messages: Photon.Chat.Message[]) {
        if (!this.isMainClient) return;

        this.dispatchEvent(EventType.ChatClientChatMessages, channelName, messages);
    }

    onPrivateMessage(channelName: string, message: Photon.Chat.Message): void {
        // console.log("onPrivateMessage", channelName, message);
    }

    onSubscribeResult(results: Object): void {
        // console.log("onSubscribeResult", results);
        console.log(this.getPublicChannels());
        console.log(this.getPrivateChannels());

        for (var channel in this.getPublicChannels()) {
            this.subscriptChannels[channel] = SubscribeStatus.Subscribed;
        }
    }

    onUnsubscribeResult(results: Object): void {
        console.log("onUnsubscribeResult");
    }

    onUserStatusUpdate(userId: string, status: number, gotMessage: boolean, statusMessage: string): void {
        console.log("onUserStatusUpdate", userId, gotMessage, statusMessage);
    }

    onUserSubscribe(channelName: string, userId: string): void {
        // console.log("onUserSubscribe:", userId);
    }

    onUserUnsubscribe(channelName: string, userId: string): void {
        // console.log("onUserUnsubscribe:", userId);
    }

    connectToServer() {
        this.setUserId(this.uuid);
        this.connectToRegionFrontEnd("asia");
    }

    onGetRegionsResult(errorCode: number, errorMsg: string, regions: {
        [index: string]: string;
    }): void {
        console.log("onGetRegionsResult", errorCode, errorMsg, regions);
    }

    onWebRpcResult(errorCode: number, message: string, uriPath: string, resultCode: number, data: any): void {
        console.log("onWebRpcResult", message);
        // this.dispatchEvent("onChatClientEvent", errorCode, message, uriPath, resultCode, data);
    }

    onEvent(code: number, content: any, actorNr: number): void {
        console.log("onEvent", code, content);
        // this.dispatchEvent("onChatClientEvent", code, content, actorNr);
    }

    onOperationResponse(errorCode: number, errorMsg: string, code: number, content: any): void {
        console.info("op resp:", errorCode, errorMsg, code);
        if (errorCode) {
            switch (code) {
                default:
                    console.error("Operation Response error:", errorCode, errorMsg, code, content);
                    break;
            }
        }
    }

    dispatchEvent(eventName: string, ...args: any) {
        this.eventBase.emit(eventName, ...args);
    }
}