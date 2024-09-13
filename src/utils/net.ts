import fs from "fs";
import request from "request";
import zlib from "zlib";

export default {
    async download(url: string, dst: string): Promise<void> {
        return new Promise((resolve, reject) => {
            request.get(url)
                .on('error', (e) => {
                    reject(e);
                })
                .on('end', () => {
                    resolve(null);
                })
                .pipe(fs.createWriteStream(dst));
        });
    },

    async downloadAndZip(url: string): Promise<string> {
        return new Promise((resolve, reject) => {
            const gzip = zlib.createGzip();

            const data = [];

            request.get(url)
                .pipe(gzip)
                .on('data', (d) => {
                    data.push(d);
                })
                .on('error', (e) => {
                    reject(e);
                })
                .on('end', () => {
                    resolve(Buffer.concat(data).toString("base64"));
                });
        });
    },
};