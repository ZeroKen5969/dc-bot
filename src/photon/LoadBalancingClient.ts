import "./lib/Photon-Javascript_SDK";

export class LoadBalancingClient extends Photon.LoadBalancing.LoadBalancingClient {
    private eventsTotal: number = 0;
    private eventsSession: number = 0;

    constructor() {
        const AppId = process.env.AppIdRealtime;
        const AppVersion = `${process.env.GameVersion}_${process.env.PunVersion}`;

        super(Photon.ConnectionProtocol.Wss, AppId, AppVersion);

        // uncomment to use Custom Authentication
        // this.setCustomAuthentication("username=" + "yes" + "&token=" + "yes");

        // const AppVersion = `${GameVersion}_${PunVersion}`;
        // Output.log("[i]", "Init", this.getNameServerAddress(), DemoAppId, DemoAppVersion);
        // this.logger.info("Init", this.getNameServerAddress(), DemoAppId, DemoAppVersion);
        // this.setLogLevel(DemoConstants.LogLevel);
    }

    onStateChange(state: number) {
        console.log("onStateChange", Photon.LoadBalancing.LoadBalancingClient.StateToName(state));
        switch (state) {
            case Photon.LoadBalancing.LoadBalancingClient.State.JoinedLobby:
                // console.log(this.availableRooms());
                // this.joinRoom("node-", {createIfNotExists: true});
                break;
        }
    }

    onEvent(code: number, content: any, actorNr: number): void {
        console.log("Event:", code);
        console.log("Payload In:", content);
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

    onWebRpcResult(errorCode: number, message: string, uriPath: string, resultCode: number, data: any): void {
        console.log("onWebRpcResult", message);
    }

    raiseMyEvent() {
        console.log("raiseEvent");
        var payload = { eventsSession: this.eventsSession++, eventsTotal: this.eventsTotal++, senderName: "user" + this.myActor().actorNr };
        console.log("Payload Out:", payload);
        this.raiseEvent(1, payload, { receivers: Photon.LoadBalancing.Constants.ReceiverGroup.All, webForward: true });
    }

    private flag: boolean = false;

    onRoomListUpdate(rooms: Photon.LoadBalancing.RoomInfo[], roomsUpdated: Photon.LoadBalancing.RoomInfo[], roomsAdded: Photon.LoadBalancing.RoomInfo[], roomsRemoved: Photon.LoadBalancing.RoomInfo[]): void {
        if (this.flag) {
            return;
        }
        this.joinRandomRoom();

        console.log("onRoomListUpdate", rooms);
    }
}