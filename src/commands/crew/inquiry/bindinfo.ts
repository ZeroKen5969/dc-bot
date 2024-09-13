import Discord from "discord.js";
import tools from "../../../utils/tools";
import multiPages from "../../../utils/multiPages";
import bindingDao from "../../../database/bindingDao";
import teamMgr from "../../../firebase/teamMgr";
import crew from "../../../utils/crew";
import { CmdType } from "../../../utils/types";
 

export = {
    name: 'bindinfo',
    aliases: ["bi"],
    description: '查詢綁定訊息',
    permissions: ["ManageGuild"],
    roles: [],
    type: [CmdType.Crew],

    async execute(client: ZClient, msg: Discord.Message, args: string[]) {
        if (args.length < 1) {
            msg.channel.send({ content: '參數需至少一個!' });
            return;
        }

        const dcId = tools.pickUserId(args[0]);

        const bindDatas = await bindingDao.findAll();
        const accs = [];

        for (const crewid of crew.crewids) {
            const SubscribeList = await teamMgr.getSubscribeListInfo(crewid);

            if (dcId) {
                const data = bindDatas[dcId];
                if (data) {
                    data.accounts.forEach(accId => {
                        const crew_member = SubscribeList[accId];
                        if (crew_member) {
                            accs.push({ id: accId, crewid: crewid, member: crew_member });
                        }
                    });
                }
            } else {
                const gameId = args[0];

                for (const [key, bind] of Object.entries(bindDatas)) {

                    bind.accounts.forEach(accId => {
                        const fakeId = accId.substring(0, accId.length / 2);

                        if (fakeId.includes(gameId) || gameId.includes(fakeId)) {
                            accs.push({ dcId: key, gameId: accId });
                        } else {
                            const crew_member = SubscribeList[accId];

                            if (crew_member) {
                                const name = gameId.toLowerCase();
                                const crew_member_name = crew_member.Name.toLowerCase();

                                if (crew_member_name.includes(name)) {
                                    accs.push({ dcId: key, gameId: accId });
                                }
                            }
                        }
                    });
                }
            }
        }

        if (accs.length > 0) {
            if (dcId) {
                const title = `🔎 已綁定`;

                let counter = 0;
                const pages = tools.createEmbedMultiMessage(msg, accs, title, 10, (data) => {
                    const fakeId = data.id.substring(0, data.id.length / 2);
                    const crewname = crew.crewidnames[data.crewid];

                    return `${++counter}. \`${crewname}\` | 名稱: \`${data.member.Name}\`, ID: \`${fakeId}\`\n\n`;
                });

                await multiPages.sendMultiPages(msg, pages, 60000);
            } else {
                const title = `🔎 連結帳戶`;

                let counter = 0;
                await tools.sendEmbedMultiMessage(msg, accs, title, 15, (data) => {
                    const fakeId = data.gameId.substring(0, data.gameId.length / 2);

                    return `${++counter}. 名稱: <@${data.dcId}>, ID: \`${fakeId}\`\n\n`;
                });
            }
        } else {
            await msg.channel.send({ content: `查無資料!` });
        }
    },
} as Executor;