import Discord from "discord.js";
import teamMgr from "../firebase/teamMgr";
import crewDao from "../database/crewDao";
import bindingDao from "../database/bindingDao";
import config from "../utils/config";
import crew from "../utils/crew";
import { EventType } from "../utils/types";
 
export = {
    name: 'crewlistener',
    interval: 30 * 60 * 1000,

    async execute(client: ZClient) {
        const dispatcher = function (eventName: string, ...args: any) {
            client.emit(eventName, ...args);
        };

        const guild = client.guilds.cache.get(client.mainGuild);
        const members = (await guild.members.fetch()).filter((m) => {
            return m.roles.cache.has(config.task.crewlistener.rid) || m.permissions.has(Discord.PermissionFlagsBits.ManageGuild);
        });

        const bindDatas = await bindingDao.findAll();
        const bindMap: Dict<CrewEventPack[]> = {}; // dcid對應所有遊戲資料

        for (const cwid of crew.crewids) {
            const teaminfo = await teamMgr.getTeamInfo(cwid);
            const crewInfo = await crewDao.getAllInfo(cwid);

            const packEventData = function (cmid: string, dcid: string, member: Game.MemberInfo, db_member: ZModel.Game.Player, memberRecord: ZModel.Game.PlayerHistory) {
                const event: CrewEventPack = {
                    cwid: cwid,
                    cmid: cmid,
                    dcid: dcid,
                    members: teaminfo.SubscribeList,
                    db_members: crewInfo.members,
                    member: member,
                    db_member: db_member,
                    memberRecord: memberRecord
                };

                return event;
            };

            for (const [dcid, binds] of Object.entries(bindDatas)) {
                const dc_member = members.get(dcid);
                if (!dc_member) continue;

                binds.accounts.forEach(cmid => {
                    const crew_member = teaminfo.SubscribeList[cmid];
                    if (!crew_member) return;

                    const db_member = crewInfo.members[cmid];
                    const memberRecord = crewInfo.membersRecord[cmid];
                    const eventData = packEventData(cmid, dcid, crew_member, db_member, memberRecord);

                    bindMap[dcid] = bindMap[dcid] || [];
                    bindMap[dcid].push(eventData);
                });
            }

            for (const id in teaminfo.SubscribeList) {
                const crew_member = teaminfo.SubscribeList[id];
                const db_member = crewInfo.members[id];
                const memberRecord = crewInfo.membersRecord[id];
                const eventData = packEventData(id, null, crew_member, db_member, memberRecord);
                const isNewMember = !(memberRecord && memberRecord.names);

                if (!db_member) {
                    // 重入團的成員名字不同了
                    if (!isNewMember && memberRecord.names[memberRecord.names.length - 1] != crew_member.Name) {
                        // 老玩家名稱不同的話從歷史紀錄抓名稱
                        eventData.db_member = {
                            name: memberRecord.names[memberRecord.names.length - 1],
                        };
                        dispatcher(EventType.CrewMemberNameChange, eventData, isNewMember);
                    }

                    // 有人入團
                    dispatcher(EventType.CrewMemberJoin, eventData, isNewMember);
                } else {
                    // 有人改名
                    if (db_member.name != crew_member.Name) {
                        dispatcher(EventType.CrewMemberNameChange, eventData, isNewMember);
                    }
                }
            }

            for (const id in crewInfo.members) {
                const crew_member = teaminfo.SubscribeList[id];
                const db_member = crewInfo.members[id];
                const memberRecord = crewInfo.membersRecord[id];
                const eventData = packEventData(id, null, crew_member, db_member, memberRecord);

                if (!crew_member) {
                    // 有人退團
                    dispatcher(EventType.CrewMemberLeave, eventData);
                }
            }
        }

        for (const [_, dc_member] of members) {
            const bindevts = bindMap[dc_member.id] || [];

            for (const cwid of crew.crewids) {
                const crid = crew.roles[cwid];

                if (!crid) continue;

                let has = bindevts.find((e) => e.cwid == cwid);

                if (cwid == "crewid11" && dc_member.id == "specialid") {
                    has = {} as CrewEventPack;
                }

                // 管理員不給
                if (dc_member.permissions.has(Discord.PermissionFlagsBits.ManageGuild)) {
                    has = null;
                }

                if (has && !dc_member.roles.cache.get(crid)) {
                    dispatcher(EventType.CrewRoleChange, dc_member, crid, true);
                } else if (!has && dc_member.roles.cache.get(crid)) {
                    dispatcher(EventType.CrewRoleChange, dc_member, crid, false);
                }
            }
        }
    },
} as Executor;