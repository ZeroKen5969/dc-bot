import Discord from "discord.js";
import genshinDao from "../../database/genshinDao";
import genshin from "../../utils/genshin";
import tools from "../../utils/tools";
import { CmdType } from "../../utils/types";

export = {
    name: "setcookie",
    aliases: [],
    description: '設置原神cookie',
    users: ["uidzz", "uid00"],
    type: [CmdType.Genshin],
    dm: true,

    async execute(client: ZClient, msg: Discord.Message, args: string[]) {
        if (args.length < 1) {
            await msg.reply({ content: '需給予綁定cookie!' });
            return;
        }

        const cookie = args.filter(
            (d) => [
                "account_id",
                "account_id_v2",
                "account_mid_v2",
                "cookie_token",
                "cookie_token_v2",
                "ltmid",
                "ltmid_v2",
                "ltoken",
                "ltoken_v2",
                "ltuid",
                "ltuid_v2"
            ].indexOf(d.split("=")[0]) >= 0
        ).join(" ");

        const result = await genshin.getGameAccounts(cookie);
        if (result.retcode != 0) {
            await msg.reply({ content: `取得帳號資訊錯誤! 錯誤代碼: ${result.retcode}, 錯誤訊息: ${result.message}` });
        }

        const uids = result.data.list.filter((acc) => acc.game_biz == "hk4e_global").map((acc) => acc.game_uid);
        await genshinDao.setCookie(msg.author.id, tools.aesEncrypt(cookie, genshin.COOKIE_SECRET), uids);

        const accounts = result.data.list.map((acc) => `[${acc.game_uid}] ${acc.nickname}`).join(", ");
        await msg.reply({ content: `綁定完成! 綁定帳戶: ${accounts}` });
    },
} as Executor;