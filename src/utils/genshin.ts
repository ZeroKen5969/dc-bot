import crypto from "crypto";
import request from "request";
import moment from "../utils/moment";

class Genshin {
    private TAKUMI_URL = "https://api-os-takumi.mihoyo.com";
    private BBS_HOYOLAB_URL = "https://bbs-api-os.hoyolab.com";
    private SG_HOYOLAB_URL = "https://sg-hk4e-api.hoyolab.com";

    private SECRET_SALT = "6s25p5ox5y14umn1p61aqyyvbvvl3lrt";
    private ASCII_LETTERS = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";

    public COOKIE_SECRET = Buffer.from("Gf32Ke;f$z-=kWY!dM1;/=D:f?95$Rwq", "utf-8");

    private UserAgent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.3";

    async getGameAccounts(cookie: string): Promise<Genshin.GameAccountsResponse> {
        return new Promise((resolve, reject) => {
            request.get(`${this.TAKUMI_URL}/binding/api/getUserGameRolesByCookie`, {
                headers: {
                    "cookie": cookie,
                    "user-agent": this.UserAgent,
                }
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

    async getRealTimeNotes(cookie: string, uid: string): Promise<Genshin.RealTimeNotesResponse> {
        return new Promise((resolve, reject) => {
            request.get(`${this.BBS_HOYOLAB_URL}/game_record/genshin/api/dailyNote`, {
                headers: {
                    "cookie": cookie,
                    "user-agent": this.UserAgent,
                    "x-rpc-language": "zh-tw",
                    "x-rpc-app_version": "1.5.0",
                    "x-rpc-client_type": "5",
                    "ds": this.generateDynamicSecret(),
                },
                qs: {
                    server: "os_asia",
                    role_id: uid,
                }
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

    async checkInCommunity(cookie: string): Promise<Genshin.Response> {
        return new Promise((resolve, reject) => {
            request.post(`${this.BBS_HOYOLAB_URL}/community/apihub/wapi/mission/signIn`, {
                headers: {
                    "cookie": cookie,
                    "user-agent": this.UserAgent,
                },
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

    async claimDailyReward(cookie: string): Promise<Genshin.Response> {
        return new Promise((resolve, reject) => {
            request.post(`${this.SG_HOYOLAB_URL}/event/sol/sign?act_id=e202102251931481`, {
                headers: {
                    "cookie": cookie,
                    "user-agent": this.UserAgent,
                    "referer": "https://act.hoyolab.com/",
                    'origin': 'https://act.hoyolab.com'
                },
            }, function (err, response, body) {
                console.log(err, body);
                if (err || response.statusCode != 200) {
                    reject();
                    return;
                }
                const data = JSON.parse(body);
                resolve(data);
            });
        });
    }

    private generateDynamicSecret() {
        const t = moment().unix();
        let r = "";
        for (let i = 0; i < 6; ++i) {
            r += this.ASCII_LETTERS[Math.floor(this.ASCII_LETTERS.length * Math.random())];
        }
        const md5 = crypto.createHash('md5');
        const h = md5.update(`salt=${this.SECRET_SALT}&t=${t}&r=${r}`).digest('hex');
        return `${t},${r},${h}`;
    }
}

export default new Genshin();