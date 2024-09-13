import genshinDao from "../database/genshinDao";
import genshin from "../utils/genshin";
import moment from "../utils/moment";
import tools from "../utils/tools";

export = {
    name: 'genshinchecker',
    interval: 30 * 60 * 1000,

    async execute(client: ZClient) {
        this.currentDate = moment().utcOffset(8);

        const storeCookies = await genshinDao.getAllStoreCookie();
        for (const cookieData of storeCookies) {
            // 還原cookie
            cookieData.cookie = tools.aesDecrypt(cookieData.cookie, genshin.COOKIE_SECRET);

            const user = await client.users.fetch(cookieData.userId);

            for (const uid of cookieData.uids) {
                const notesResponse = await genshin.getRealTimeNotes(cookieData.cookie, uid);
                if (notesResponse.retcode == 0) {
                    if (notesResponse.data.current_home_coin >= notesResponse.data.max_home_coin / 4 * 3) {
                        await user.send({ content: `塵歌壺已達3/4, 當前數量: ${notesResponse.data.current_home_coin}` });
                    }
                    if (notesResponse.data.current_resin >= notesResponse.data.max_resin / 4 * 3) {
                        await user.send({ content: `樹脂已達3/4, 當前數量: ${notesResponse.data.current_resin}` });
                    }
                } else {
                    await user.send({ content: `即時便箋頁面資訊獲取錯誤! 錯誤代碼: ${notesResponse.retcode}, 錯誤訊息: ${notesResponse.message}` });
                }
            }

            const signData = await genshinDao.getSignStatus(cookieData.userId);

            let hoyolabSignTime: number = undefined;
            let genshinSignTime: number = undefined;

            if (!this.currentDate.isSame(signData.hoyolabLastSign, 'day')) {
                const hoyolabSignResponse = await genshin.checkInCommunity(cookieData.cookie);
                if (hoyolabSignResponse.retcode == 0) {
                    hoyolabSignTime = moment().utcOffset(8).valueOf();
                    await user.send({ content: `已自動完成hoyolab簽到!` });
                } else if (hoyolabSignResponse.retcode == 2001) {
                    hoyolabSignTime = moment().utcOffset(8).valueOf();
                    await user.send({ content: `hoyolab已簽到過...` });
                } else {
                    await user.send({ content: `hoyolab簽到錯誤! 錯誤代碼: ${hoyolabSignResponse.retcode}, 錯誤訊息: ${hoyolabSignResponse.message}` });
                }
            }

            if (!this.currentDate.isSame(signData.genshinLastSign, 'day')) {
                const genshinSignResponse = await genshin.claimDailyReward(cookieData.cookie);
                if (genshinSignResponse.retcode == 0) {
                    genshinSignTime = moment().utcOffset(8).valueOf();
                    await user.send({ content: `已自動完成原神簽到!` });
                } else if (genshinSignResponse.retcode == -5003) {
                    genshinSignTime = moment().utcOffset(8).valueOf();
                    await user.send({ content: `原神已簽到過...` });
                } else {
                    await user.send({ content: `原神簽到錯誤! 錯誤代碼: ${genshinSignResponse.retcode}, 錯誤訊息: ${genshinSignResponse.message}` });
                }
            }

            await genshinDao.updateSignTime(cookieData.userId, hoyolabSignTime, genshinSignTime);
        }
    },
} as GenshinChecker;
