export enum CmdType {
    All = "all",
    Music = "music",
    Crew = "crew",
    Genshin = "genshin",
    Universal = "universal"
}

export enum EventType {
    CrewMemberNameChange = "crewMemberNameChange",
    CrewMemberJoin = "crewMemberJoin",
    CrewMemberLeave = "crewMemberLeave",
    CrewRoleChange = "crewRoleChange",
    eggsAppear = "eggsAppear",
    CrewStageChanged = "crewStageChanged",
    CrewRaidReseted = "crewRaidReseted",
    ChatClientChatMessages = "chatClientChatMessages",
}

export enum EggType {
    PartSame,
    PartWithStartSame,
    PartWithEndSame,
    FullSame,
}

export enum EggRuleType {
    IgnoreCase,
    Multiple,
}

const CmdTypeName = {
    [CmdType.All]: "全部指令",
    [CmdType.Music]: "音樂指令",
    [CmdType.Crew]: "團隊指令",
    [CmdType.Universal]: "通用指令",
};

export {
    CmdTypeName
};