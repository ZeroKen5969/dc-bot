import request from "request";
import tools from "./tools";
import moment from "./moment";

class SteamAPI {
    private freeText: string[] = ["Free", "免費"];
    private apiPath: string = "https://api.steampowered.com";
    private storePath: string = "https://store.steampowered.com";

    checkCacheTime(time: number, durationMS: number = 60 * 60 * 1000) {
        if (!time) return false;

        const lastTime = moment(time);
        const currTime = moment();
        return currTime.diff(lastTime) < durationMS;
    }

    async getAppList(): Promise<Steam.AppList> {
        return new Promise((resolve, reject) => {
            request.get(`${this.apiPath}/ISteamApps/GetAppList/v2`, {
            }, function (err, response, body) {
                if (err || response.statusCode != 200) {
                    reject();
                    return;
                }
                const data = JSON.parse(body);
                resolve(data);
            });
        });
    }

    async *getGameDetails(cache: Dict<ZModel.Steam.FreeDetail> = {}, cacheKeepTime: number = 0): AsyncGenerator<Dict<Steam.AppDetail>> {
        const appList = (await this.getAppList()).applist.apps.filter(
            e => !cache[e.appid] || !this.checkCacheTime(cache[e.appid].lastUpdatedTime, cacheKeepTime)
        );

        const size = 100;
        
        while (appList.length > 0) {
            const apps = appList.splice(0, size);
            yield await new Promise<Dict<Steam.AppDetail>>((resolve, reject) => {
                request.get(`${this.storePath}/api/appdetails`, {
                    qs: {
                        appids: apps.map(e => e.appid).join(","),
                        filters: "price_overview"
                    }
                }, function (err, response, body) {
                    if (err || response.statusCode != 200) {
                        // console.log("error", err, " =========== ", response);
                        reject();
                        return;
                    }
                    const data = JSON.parse(body);
                    resolve(data);
                });
            });

            // 休息2秒, 避免被限制請求
            await tools.sleep(2500);
        }
    }

    async *getDiscountFreeList(cache: Dict<ZModel.Steam.FreeDetail> = {}, cacheKeepTime: number = 0) {
        for await (const detailChunk of this.getGameDetails(cache, cacheKeepTime)) {
            const frees: Dict<boolean> = {};
            for (const appid in detailChunk) {
                const result = detailChunk[appid];
                if (result.success) {
                    if ((result.data?.price_overview?.discount_percent || 0) >= 100 || 
                        (result.data?.price_overview?.final || 0) > 0 && this.freeText.includes(result.data?.price_overview?.final_formatted)) {
                        frees[appid] = true;
                    }
                }
            }
            yield {
                frees: frees,
                handled: detailChunk
            };
        }
    }

    getStoreUrl(appid: string) {
        return `${this.storePath}/app/${appid}`;
    }
}

export default new SteamAPI();