import config from "../utils/config";
import steam from "../utils/steam";
import tools from "../utils/tools";
import steamDao from "../database/steamDao";

enum CacheStatus {
    Free = 1,
    Pay = 2
}

export = {
    name: 'steamfreegame',
    interval: 3 * 60 * 60 * 1000,

    async execute(client: ZClient) {
        const cache = await steamDao.getFreeDetails();
        const cacheFrees: Dict<CacheStatus> = {};

        for (const appid in cache) {
            if (cache[appid].isFree) {
                cacheFrees[appid] = CacheStatus.Free;
            }
        }

        // steam api 有限制速率, 取資料時每次取部分並存起來, 如遇服務中斷則最多只會失去100筆資料, 待下次任務時則會重拉資訊
        for await (const freeChunk of steam.getDiscountFreeList(cache, this.interval)) {
            steamDao.updateDiscountFreeGame(freeChunk.handled, freeChunk.frees);

            for (const appid in freeChunk.frees) {
                // 通知過免費遊戲則不再通知
                if (cacheFrees[appid]) {
                    delete cacheFrees[appid];
                    continue;
                }

                for (const cf of config.task.steamfreegame) {
                    const botSelf = client.getChannelInfo(cf.gid, cf.cid);
                    const msgBuf = [
                        `免費活動進行中!`,
                        `${steam.getStoreUrl(appid)}`,
                    ];
                    await tools.sendMultiMessage(botSelf, msgBuf, "", 30, (data: string) => {
                        return `${data}\n`;
                    });
                }
            }

            // 有資料但不在免費清單時做標記
            for (const appid in cacheFrees) {
                if (freeChunk.handled[appid]) {
                    cacheFrees[appid] = CacheStatus.Pay;
                }
            }
        }

        // 免費活動時間過了的遊戲
        // for (const appid in cacheFrees) {
        //     // 沒有處理過才會進這
        //     if (cacheFrees[appid] == CacheStatus.Free) continue;

        //     for (const cf of config.task.steamfreegame) {
        //         const botSelf = client.getChannelInfo(cf.gid, cf.cid);
        //         const msgBuf = [
        //             `免費活動已結束!`,
        //             `${steam.getStoreUrl(appid)}`,
        //         ];
        //         await tools.sendMultiMessage(botSelf, msgBuf, "", 30, (data: string) => {
        //             return `${data}\n`;
        //         });
        //     }
        // }
    },
} as Executor;
