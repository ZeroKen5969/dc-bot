import * as fireDatabase from "firebase/database";
import * as fireAuth from "firebase/auth";
import firebaseMgr from "./firebaseMgr";
import moment from "../utils/moment";

export default {
    async getTeam(crewid: string): Promise<Game.Crew> {
        await firebaseMgr.firebase.refreshToken();

        return new Promise((resolve, reject) => {
            const ref = fireDatabase.ref(firebaseMgr.teamPrivateDB, `PrivateData/${crewid}`);

            fireDatabase.get(ref)
                .then(function (snapshot) {
                    const data = snapshot.val();
                    resolve(data);
                });
        });
    },

    async getTeamInfo(crewid: string): Promise<Game.CrewMembersInfo> {
        await firebaseMgr.firebase.refreshToken();

        return new Promise((resolve, reject) => {
            const ref = fireDatabase.ref(firebaseMgr.teamMemberDB, `MemberData/${crewid}`);

            fireDatabase.get(ref)
                .then((snapshot) => {
                    const data = (snapshot.val() || {}) as Game.CrewMembersInfo;

                    data.BlackList = data.BlackList || {};
                    data.SignUpList = data.SignUpList || {};
                    data.SubscribeList = data.SubscribeList || {};

                    resolve(data);
                });
        });
    },

    async getSubscribeListInfo(crewid: string): Promise<Game.MembersInfo> {
        await firebaseMgr.firebase.refreshToken();

        return new Promise((resolve, reject) => {
            const ref = fireDatabase.ref(firebaseMgr.teamMemberDB, `MemberData/${crewid}/Subscribes`);

            fireDatabase.get(ref)
                .then((snapshot) => {
                    resolve(snapshot.val() || {});
                });
        });
    },

    async getSignInfo(crewid: string): Promise<Game.MembersInfo> {
        await firebaseMgr.firebase.refreshToken();

        return new Promise((resolve, reject) => {
            const ref = fireDatabase.ref(firebaseMgr.teamMemberDB, `MemberData/${crewid}/SignUps`);

            fireDatabase.get(ref)
                .then((snapshot) => {
                    resolve(snapshot.val() || {});
                });
        });
    },

    async getBlackInfo(crewid: string): Promise<Game.MembersInfo> {
        await firebaseMgr.firebase.refreshToken();

        return new Promise((resolve, reject) => {
            const ref = fireDatabase.ref(firebaseMgr.teamMemberDB, `MemberData/${crewid}/Blacks`);

            fireDatabase.get(ref)
                .then((snapshot) => {
                    resolve(snapshot.val() || {});
                });
        });
    },

    async clearBlackInfo(crewid: string): Promise<Game.MembersInfo> {
        await firebaseMgr.firebase.refreshToken();

        return new Promise((resolve, reject) => {
            const ref = fireDatabase.ref(firebaseMgr.teamMemberDB, `MemberData/${crewid}/Blacks`);

            fireDatabase.set(ref, {})
                .then((snapshot) => {
                    resolve(null);
                });
        });
    },

    async clearTeamInfo(crewid: string): Promise<Game.CrewMembersInfo> {
        await firebaseMgr.firebase.refreshToken();

        return new Promise((resolve, reject) => {
            const ref = fireDatabase.ref(firebaseMgr.teamMemberDB, `MemberData/${crewid}`);

            fireDatabase.set(ref, {})
                .then(() => {
                    resolve(null);
                });
        });
    },

    async backTeamReward(crewid: string, type: number, id: number, num: number): Promise<number> {
        await firebaseMgr.firebase.refreshToken();

        const uuid = fireAuth.getAuth().currentUser.uid;

        const ref = fireDatabase.ref(firebaseMgr.teamPrivateDB, `MailData/${crewid}`);

        const mails = Object.entries(((await fireDatabase.get(ref)).val() || {}) as Dict<Game.MailInfo>).filter(([mid, reward]: [string, Game.MailInfo]) => {
            return mid.startsWith(uuid) && reward.rt == type && reward.ri == id;
        }).sort(([_, reward1]: [string, Game.MailInfo], [__, reward2]: [string, Game.MailInfo]) => {
            const t1 = moment.tz(reward1.t, 'MM/DD/YYYY h:mm:ss a', 'Asia/Seoul').valueOf();
            const t2 = moment.tz(reward2.t, 'MM/DD/YYYY h:mm:ss a', 'Asia/Seoul').valueOf();
            return t2 - t1;
        });

        const actions: Promise<void>[] = [];
        const len = Math.min(Math.max(num, 0), mails.length);

        for (let i = 0; i < len; ++i) {
            const [mid, _] = mails[i];
            const child = fireDatabase.child(ref, mid);
            actions.push(fireDatabase.remove(child));
        }

        await Promise.allSettled(actions);

        return len;
    },

    async clearExpiredMail(crewid: string): Promise<any> {
        await firebaseMgr.firebase.refreshToken();

        return new Promise((resolve, reject) => {
            const ref = fireDatabase.ref(firebaseMgr.teamPrivateDB, `MailData/${crewid}`);
            fireDatabase.get(ref).then((res) => {
                const mails = res.val();

                const actions = [];
                for (const id in mails) {
                    let texp = moment.tz(mails[id].texp, "MM/DD/YYYY h:mm:ss A", "Asia/Seoul");
                    let curr = moment().utcOffset(9);
                    if (texp.diff(curr) < 0) {
                        actions.push(this.removeMail(crewid, id));
                    }
                }

                Promise.allSettled(actions).then((res) => {
                    resolve(res);
                });
            });
        });
    },

    async removeMail(crewid: string, mailid: string): Promise<void> {
        await firebaseMgr.firebase.refreshToken();

        return new Promise((resolve, reject) => {
            const ref = fireDatabase.ref(firebaseMgr.teamPrivateDB, `MailData/${crewid}/${mailid}`);
            fireDatabase.remove(ref)
                .then(() => {
                    resolve(null);
                });
        });
    },

    // status ==> 已取消: null, 未處理: 0, 已接受: 1, 已拒絕: 2
    async acceptSign(crewid: string, uuid: string, status: number): Promise<number> {
        await firebaseMgr.firebase.refreshToken();

        return new Promise((resolve, reject) => {
            let ref = fireDatabase.ref(firebaseMgr.teamDB, `SignData/${uuid}/${crewid}`);

            fireDatabase.get(ref)
                .then(function (snapshot) {
                    let data = snapshot.val();

                    // 申請者未取消申請
                    if (data != null) {
                        data = status;
                        fireDatabase.set(ref, data);
                    }

                    ref = fireDatabase.ref(firebaseMgr.teamMemberDB, `MemberData/${crewid}/SignUps/${uuid}`);
                    fireDatabase.remove(ref)
                        .then(() => {
                            resolve(data);
                        });
                });
        });
    },

    async kickMember(crewid: string, uuid: string): Promise<Game.MemberInfo> {
        await firebaseMgr.firebase.refreshToken();

        return new Promise((resolve, reject) => {
            const ref = fireDatabase.ref(firebaseMgr.teamMemberDB, `MemberData/${crewid}/Subscribes/${uuid}`);

            fireDatabase.get(ref)
                .then((snapshot) => {
                    const data = snapshot.val();

                    if (data != null) {
                        Promise.all([fireDatabase.remove(ref), this.incrMemberNum(crewid, -1)])
                            .then(() => {
                                resolve(data);
                            });
                    } else {
                        resolve(data);
                    }
                });
        });
    },

    async banMember(crewid: string, uuid: string): Promise<Game.MemberInfo> {
        await firebaseMgr.firebase.refreshToken();

        return new Promise((resolve, reject) => {
            const ref = fireDatabase.ref(firebaseMgr.teamMemberDB, `MemberData/${crewid}/Subscribes/${uuid}`);

            fireDatabase.get(ref)
                .then((snapshot) => {
                    const data = snapshot.val();

                    if (data != null) {
                        const ref_black = fireDatabase.ref(firebaseMgr.teamMemberDB, `MemberData/${crewid}/Blacks/${uuid}`);
                        Promise.all([fireDatabase.remove(ref), fireDatabase.set(ref_black, data), this.incrMemberNum(crewid, -1)])
                            .then(() => {
                                resolve(data);
                            });
                    } else {
                        resolve(data);
                    }
                });
        });
    },

    async unbanMember(crewid: string, uuid: string): Promise<Game.MemberInfo> {
        await firebaseMgr.firebase.refreshToken();

        return new Promise((resolve, reject) => {
            const ref = fireDatabase.ref(firebaseMgr.teamMemberDB, `MemberData/${crewid}/Blacks/${uuid}`);

            fireDatabase.get(ref)
                .then(function (snapshot) {
                    const data = snapshot.val();

                    if (data != null) {
                        fireDatabase.remove(ref)
                            .then(() => {
                                resolve(data);
                            });
                    } else {
                        resolve(data);
                    }
                });
        });
    },

    async changeMemberNum(crewid: string, target: number): Promise<void> {
        await firebaseMgr.firebase.refreshToken();

        let currNum = target;

        const ref = fireDatabase.ref(firebaseMgr.teamPrivateDB, `PrivateData/${crewid}/Num`);

        do {
            await fireDatabase.runTransaction(ref, (num) => {
                num = num || 0;
                num += num > target ? -1 : num < target ? 1 : 0;

                return num;
            }).then((result) => {
                currNum = result.snapshot.val();
            });
        } while (target != currNum);
    },

    async changeExp(crewid: string, target: number): Promise<void> {
        await firebaseMgr.firebase.refreshToken();

        const onceVal = 100;
        let currNum = target;

        const ref = fireDatabase.ref(firebaseMgr.teamPrivateDB, `PrivateData/${crewid}/Exp`);

        do {
            await fireDatabase.runTransaction(ref, (num) => {
                num = num || 0;
                num += num > target ? -Math.min(onceVal, num - target) : num < target ? Math.min(onceVal, target - num) : 0;

                return num;
            }).then((result) => {
                currNum = result.snapshot.val();
            });
        } while (target != currNum);
    },

    async changeName(crewid: string, name: string): Promise<string> {
        await firebaseMgr.firebase.refreshToken();

        return new Promise((resolve, reject) => {

            const ref = fireDatabase.ref(firebaseMgr.teamPrivateDB, `PrivateData/${crewid}/Name`);


            fireDatabase.set(ref, name)
                .then(() => {
                    resolve(name);
                });
        });
    },

    async changeProfile(crewid: string, profile: number): Promise<number> {
        await firebaseMgr.firebase.refreshToken();

        return new Promise((resolve, reject) => {

            const ref = fireDatabase.ref(firebaseMgr.teamPrivateDB, `PrivateData/${crewid}/Profile`);


            fireDatabase.set(ref, profile)
                .then(() => {
                    resolve(profile);
                });
        });
    },

    async changeMemberAuth(crewid: string, uuid: string, auth: number): Promise<number> {
        await firebaseMgr.firebase.refreshToken();

        return new Promise((resolve, reject) => {
            const ref = fireDatabase.ref(firebaseMgr.teamMemberDB, `MemberData/${crewid}/Subscribes/${uuid}/Auth`);

            fireDatabase.set(ref, auth)
                .then(() => {
                    resolve(auth);
                });
        });
    },

    async addMember(crewid: string, uuid: string, name: string): Promise<number> {
        await firebaseMgr.firebase.refreshToken();

        return new Promise((resolve, reject) => {
            const ref = fireDatabase.ref(firebaseMgr.teamMemberDB, `MemberData/${crewid}/Subscribes/${uuid}`);

            fireDatabase.set(ref, {
                "Name": name,
            }).then(() => {
                this.incrMemberNum(crewid, 1).then(() => {
                    resolve(null);
                });
            });

        });
    },

    async getCrewRaidInfo(cwid: string): Promise<Game.CrewRaidRecord> {
        return new Promise((resolve, reject) => {
            const ref = fireDatabase.ref(firebaseMgr.channelRankDB, `RaidData/Score/${cwid}`);

            fireDatabase.get(ref)
                .then(function (snapshot) {
                    const data: Game.CrewRaidRecord = snapshot.val();
                    resolve(data);
                });
        });
    },

    async incrMemberNum(crewid: string, num: number) {
        await firebaseMgr.firebase.refreshToken();
    
        return new Promise((resolve, reject) => {
            const ref = fireDatabase.ref(firebaseMgr.teamPrivateDB, `PrivateData/${crewid}/Count`);
    
            fireDatabase.set(ref, fireDatabase.increment(num))
                .then(() => {
                    resolve(null);
                });
        });
    }
};