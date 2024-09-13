import Discord from "discord.js";
import tools from "../../../utils/tools";
import multiPages from "../../../utils/multiPages";
import bindingDao from "../../../database/bindingDao";
import teamMgr from "../../../firebase/teamMgr";
import crew from "../../../utils/crew";
import userMgr from "../../../firebase/userMgr";
import { CmdType } from "../../../utils/types";
 

export = {
    name: 'unregisterfind',
    aliases: ["unregf"],
    description: '搜尋並從DC帳戶取消綁定遊戲帳戶',
    permissions: ["ManageGuild"],
    roles: [],
    type: [CmdType.Crew],

    async execute(client: ZClient, msg: Discord.Message, args: string[]) {
        if (args.length < 1) {
            await msg.channel.send({ content: '參數需至少一個!' });
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

        const may: Game.MemberFullInfo[] = [];
        
        const bindData = await bindingDao.find(dcId);

        if (bindData) {
            const crewMembers: Dict<Game.MembersInfo> = {};
            
            // 先找出成員集合
            for (const crewid of crew.crewids) {
                crewMembers[crewid] = await teamMgr.getSubscribeListInfo(crewid);
            }

            if (bindData.accounts) {
                for(let i = 0; i < bindData.accounts.length; ++i) {
                    let isFind = false;
                    const cmid = bindData.accounts[i];
                    for (const crewid of crew.crewids) {
                        const crew_member = crewMembers[crewid][cmid];
                        if (crew_member) {
                            may.push({ crewid: crewid, id: cmid, data: crew_member });
                            isFind = true;
                        }
                    }
                    if (!isFind) {
                        const gameInfo = await userMgr.getBattleInfo(cmid);
                        const teamid = await userMgr.getTeam(cmid);
                        may.push({ crewid: teamid, id: cmid, data: { Name: gameInfo.Name } });
                    }
                }
            }
        }

        if (may.length > 0) {
            const title = `🔎 已綁帳戶`;

            let counter = 0;
            const pages = tools.createEmbedMultiMessage(msg, may, title, 10, (data: Game.MemberFullInfo) => {
                const fakeId = data.id.substring(0, data.id.length / 2);
                const crewname = crew.crewidnames[data.crewid] || "非團員";

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

                    const data = await bindingDao.find(dcId);

                    const idx = data.accounts.findIndex(acc => acc == gameId);
                    if (idx < 0) {
                        await msg.channel.send({ content: `未發現可刪除資料!` });
                        return;
                    }

                    data.accounts.splice(idx, 1);

                    await bindingDao.update(data);

                    await msg.channel.send({ content: `刪除ID\`${gameId}\`成功!` });
                }
            });
        } else {
            await msg.channel.send({ content: `查無資料!` });
        }
    },
} as Executor;