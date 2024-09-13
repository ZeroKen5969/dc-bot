import * as firebaseApp from "firebase/app";
import * as fireDatabase from "firebase/database";
import * as fireAuth from "firebase/auth";
import { UserImpl } from '@firebase/auth/internal';

import fs from "fs";
import path from "path";
import dbConfig from "./configs/dbConfig";
import tools from "../utils/tools";

const cache_users: Dict<{ app: firebaseApp.FirebaseApp, database: fireDatabase.Database }> = {};

firebaseApp.initializeApp(dbConfig.app);

// fireDatabase.enableLogging(true, true)

const team = firebaseApp.initializeApp(dbConfig.team, "team");

const teamMember = firebaseApp.initializeApp(dbConfig.teamMember, "teamMember");

const teamPrivate = firebaseApp.initializeApp(dbConfig.teamPrivate, "teamPrivate");

const common = firebaseApp.initializeApp(dbConfig.common, "common");

const index = firebaseApp.initializeApp(dbConfig.index, "index");

const rank = firebaseApp.initializeApp(dbConfig.rank, "rank");

const battle = firebaseApp.initializeApp(dbConfig.battle, "battle");

const channelRank = firebaseApp.initializeApp(dbConfig.channelRank, "channelRank");

const login = firebaseApp.initializeApp(dbConfig.login, "login");

const apps = [
    undefined, // 預設app
    team,
    teamMember,
    teamPrivate,
    common,
    index,
    rank,
    battle,
    channelRank,
    login
];

interface FirebaseExtend {
    rd_user: string;
    refreshToken(): Promise<string>;
    loginWithFile(name?: string, noLog?: boolean): Promise<void>;
    loginUser(path: string): Promise<fireDatabase.Database>;
    saveUserToFile(): void;
}

const firebase: (typeof firebaseApp & FirebaseExtend) = firebaseApp as any;

firebase.refreshToken = async function () {
    let token: string = null;
    do {
        try {
            token = await fireAuth.getAuth().currentUser.getIdToken();
        } catch (e) {
            // console.log(e);
            await tools.sleep(100);
        }
    } while (!token);

    for (let i = 1; i < apps.length; ++i) {
        await fireAuth.getAuth(apps[i]).updateCurrentUser(fireAuth.getAuth().currentUser);
    }

    return token;
};

firebase.loginWithFile = async function (name: string = "anon_0", noLog: boolean = false) {
    this.rd_user = path.resolve(`./res/tokens`, `${name}.json`);

    const userData = tools.readJsonData(this.rd_user);
    const user: fireAuth.User = UserImpl._fromJSON(fireAuth.getAuth() as any, userData);

    await fireAuth.getAuth().updateCurrentUser(user);

    const token = await firebase.refreshToken();

    if (!noLog) {
        console.log(token);
        console.log("AUTH: Success!");
    }
};

firebase.loginUser = function (path) {
    if (!cache_users[path]) {
        const app = firebaseApp.initializeApp(dbConfig.user(path), `user_${path}`);
        cache_users[path] = {
            app: app,
            database: fireDatabase.getDatabase(app)
        };
    }

    const userApp = cache_users[path].app;
    const userDB = cache_users[path].database;

    return new Promise((resolve, reject) => {
        Promise.all([
            fireAuth.getAuth(userApp).updateCurrentUser(fireAuth.getAuth().currentUser),
        ]).then((_) => {
            resolve(userDB);
        }).catch((err) => {
            reject(err);
        });
    });
};

firebase.saveUserToFile = function () {
    tools.writeJsonData(this.rd_user, fireAuth.getAuth().currentUser);
};

export default {
    firebase,
    team: team,
    teamMember: teamMember,
    teamPrivate: teamPrivate,
    common: common,
    index: index,
    teamDB: fireDatabase.getDatabase(team),
    teamMemberDB: fireDatabase.getDatabase(teamMember),
    teamPrivateDB: fireDatabase.getDatabase(teamPrivate),
    commonDB: fireDatabase.getDatabase(common),
    indexDB: fireDatabase.getDatabase(index),
    rankDB: fireDatabase.getDatabase(rank),
    battleDB: fireDatabase.getDatabase(battle),
    channelRankDB: fireDatabase.getDatabase(channelRank),
    loginDB: fireDatabase.getDatabase(login),
    totalAccounts: fs.readdirSync(path.resolve(`./res/tokens`)).length
};