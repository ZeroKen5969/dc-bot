import * as fireDatabase from "firebase/database";
import firebaseMgr from "./firebaseMgr";
import moment from "../utils/moment";

export default {
    async getBanInfo(uuid: string): Promise<string> {
        await firebaseMgr.firebase.refreshToken();

        return new Promise((resolve, reject) => {
            const ref = fireDatabase.ref(firebaseMgr.commonDB, `Accounts/${uuid}`);

            fireDatabase.get(ref)
                .then(function (snapshot) {
                    const res = snapshot.val();
                    resolve(res);
                });
        });
    },

    async getReportInfo(uuid: string): Promise<number> {
        await firebaseMgr.firebase.refreshToken();

        return new Promise((resolve, reject) => {
            const ref = fireDatabase.ref(firebaseMgr.commonDB, `ReportInfos/${uuid}`);

            fireDatabase.get(ref)
                .then(function (snapshot) {
                    const res = snapshot.val();
                    let total = 0;

                    for (const key in res) {
                        total += Object.keys(res[key]).length;
                    }

                    resolve(total);
                });
        });
    },

    async getOldReportInfo(uuid: string): Promise<number> {
        await firebaseMgr.firebase.refreshToken();

        return new Promise((resolve, reject) => {
            const ref = fireDatabase.ref(firebaseMgr.commonDB, `Report/${uuid}`);

            fireDatabase.get(ref)
                .then(function (snapshot) {
                    const res = snapshot.val();
                    resolve(Object.keys(res || {}).length);
                });
        });
    },

    async getCheatInfo(uuid: string): Promise<any> {
        await firebaseMgr.firebase.refreshToken();

        return new Promise((resolve, reject) => {
            const ref = fireDatabase.ref(firebaseMgr.commonDB, `Users/${uuid}`);

            fireDatabase.get(ref)
                .then(function (snapshot) {
                    const res = snapshot.val();
                    resolve(res);
                });
        });
    },

    async getBattleInfo(uuid: string): Promise<Game.ProfileData> {
        const ref = fireDatabase.ref(firebaseMgr.battleDB, `Battle/${uuid}`);
        const snapshot = await fireDatabase.get(ref);
        return snapshot.val();
    },

    async setTeam(uuid: string, cwid: string): Promise<void> {
        return new Promise((resolve, reject) => {
            const ref = fireDatabase.ref(firebaseMgr.teamDB, `Team/${uuid}`);

            fireDatabase.set(ref, cwid)
                .then(function () {
                    resolve(null);
                });
        });
    },

    async getTeam(uuid: string): Promise<string> {
        return new Promise((resolve, reject) => {
            const ref = fireDatabase.ref(firebaseMgr.teamDB, `Team/${uuid}`);

            fireDatabase.get(ref)
                .then(function (snapshot) {
                    const data = snapshot.val();
                    resolve(data);
                });
        });
    },

    async setName(userDB: fireDatabase.Database, uuid: string, name: string) {
        const ref = fireDatabase.ref(userDB, `Users/${uuid}/Name`);
        await fireDatabase.set(ref, name);
    },

    async getDBIndex(uuid: string) {
        const ref = fireDatabase.ref(firebaseMgr.indexDB, `Cluster/${uuid}`);
        const snapshot = await fireDatabase.get(ref);
        return snapshot.val();
    },

    async getGameBaseInfo(): Promise<Game.BaseInfo> {
        const ref = fireDatabase.ref(firebaseMgr.loginDB, `/BaseInfo`);
        const snapshot = await fireDatabase.get(ref);
        return snapshot.val();
    }
};