import { MongoClient } from "mongodb";

const db = {
    DB_URI: `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@${process.env.DB_HOST}?${process.env.DB_OPTION}`,
} as ZDB.Database;

const dbClient = new MongoClient(db.DB_URI) as ZDB.Client;

db.svr = dbClient;

db.svr.connect2DB = async function () {
    return this.connect();
};

db.svr.closeDB = async function () {
    return this.close();
};

export default db;