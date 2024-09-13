import Discord from "discord.js";
import teamMgr from "../../../firebase/teamMgr";
import crew from "../../../utils/crew";
 
import { CmdType } from "../../../utils/types";
 

export = {
    name: 'changeauth',
    aliases: ["ca"],
    description: '修改成員權限',
    permissions: [],
    roles: [],
    users: ["uid00", "uidzz"],
    dbAdmin: true,
    type: [CmdType.Crew],

    async execute(client: ZClient, msg: Discord.Message, args: string[]) {
        if (args.length < 2) {
            await msg.channel.send({ content: '參數需至少二個!' });
            return;
        }

        const AUTH_LIST: number[] = [0, 1, 2];
        const gameId = args[0];
        const auth = parseInt(args[1]);

        if (!AUTH_LIST.includes(auth)) {
            await msg.channel.send({ content: '權限不正確!' });
            return;
        }

        let hasAnyAction = false;

        for (const crewid of crew.crewids) {
            const SubscribeList = await teamMgr.getSubscribeListInfo(crewid);
            const target = SubscribeList[gameId];

            if (target) {
                const leaders: Dict<boolean> = {};
                for (const id in SubscribeList) {
                    const crew_member = SubscribeList[id];
                    if (crew_member.Auth == 2) {
                        if (auth == 2) {
                            crew_member.Auth = 1;
                            await teamMgr.changeMemberAuth(crewid, id, 1);
                        } else {
                            leaders[id] = true;
                        }
                    }
                }

                if (leaders[gameId] && Object.keys(leaders).length == 1) {
                    await msg.channel.send({ content: `[警告] 修改後將沒有團隊領導!` });
                }

                target.Auth = auth;
                await teamMgr.changeMemberAuth(crewid, gameId, auth);

                const crewname = crew.crewidnames[crewid];
                await msg.channel.send({ content: `\`${crewname}\` | 修改完畢!` });

                hasAnyAction = true;
                break;
            }
        }

        if (!hasAnyAction) {
            await msg.channel.send({ content: '目標不再團隊之內!' });
        }
    },
} as Executor;