import Discord from "discord.js";
import tools from "../../../utils/tools";
import multiPages from "../../../utils/multiPages";
import bindingDao from "../../../database/bindingDao";
import teamMgr from "../../../firebase/teamMgr";
import crew from "../../../utils/crew";
import { CmdType } from "../../../utils/types";
 

export = {
    name: 'registerfindid',
    aliases: ["regfid"],
    description: '搜尋id並綁定遊戲帳戶至DC帳戶',
    permissions: ["ManageGuild"],
    roles: [],
    type: [CmdType.Crew],

    async execute(client: ZClient, msg: Discord.Message, args: string[]) {
        if (args.length < 2) {
            await msg.channel.send({ content: '參數需至少兩個!' });
            return;
        }

        const dcId = tools.pickUserId(args[0]);

        if (!dcId) {
            await msg.channel.send({ content: '需提供標記名稱!' });
            return;
        }

        const member = await tools.getGuildMember(msg.guild.members, dcId);
        if (!member) {
            await msg.channel.send({ content: '提供的使用者須在群內!' });
            return;
        }

        const uuid = args[1].toLowerCase();

        const may: Game.MemberFullInfo[] = [];

        for (const crewid of crew.crewids) {
            const SubscribeList = await teamMgr.getSubscribeListInfo(crewid);

            for (const info in SubscribeList) {
                const crew_member_uuid = info.toLowerCase();

                if (crew_member_uuid.includes(uuid)) {
                    may.push({ crewid: crewid, id: info, data: SubscribeList[info] });
                }
            }
        }

        if (may.length > 0) {
            const title = `🔎 相似成員`;

            let counter = 0;
            const pages = tools.createEmbedMultiMessage(msg, may, title, 10, (data: Game.MemberFullInfo) => {
                const fakeId = data.id.substring(0, data.id.length / 2);
                const crewname = crew.crewidnames[data.crewid];

                return `${++counter}. \`${crewname}\` | 名稱: \`${data.data.Name}\`, ID: \`${fakeId}\`\n\n`;
            });

            await multiPages.sendInputMultiPages(msg, pages, 60000, null, {
                max: 1,
                filter(m) {
                    if (m.author.id != msg.author.id) return false;
                    if (!m.content.match(/^\d+$/)) return false;

                    const index = parseInt(m.content);
                    if (isNaN(index)) return false;
                    if (index > may.length || index <= 0) return false;

                    return true;
                },
                async end(collected) {
                    msg = collected.first();

                    const index = parseInt(msg.content);
                    const gameId = may[index - 1].id;
                    const fakeId = gameId.substring(0, gameId.length / 2);

                    const data = await bindingDao.find(dcId);

                    if (data.accounts.find(acc => acc == gameId)) {
                        await msg.channel.send({ content: `已存在相同ID!` });
                        return;
                    }

                    data.accounts.push(gameId);

                    await bindingDao.update(data);

                    await msg.channel.send({ content: `綁定ID至\`${fakeId}\`成功!` });
                }
            });
        } else {
            await msg.channel.send({ content: `查無資料!` });
        }
    },
} as Executor;