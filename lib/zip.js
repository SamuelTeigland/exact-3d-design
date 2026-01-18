import archiver from "archiver";
import { PassThrough } from "stream";

/**
 * Build a ZIP in memory and return a Buffer.
 */
export async function buildZipBuffer(addEntriesFn) {
    return new Promise((resolve, reject) => {
        const archive = archiver("zip", { zlib: { level: 9 } });
        const stream = new PassThrough();
        const chunks = [];

        stream.on("data", (c) => chunks.push(c));
        stream.on("end", () => resolve(Buffer.concat(chunks)));
        stream.on("error", reject);

        archive.on("warning", (err) => {
            // warnings (like missing files) should still be treated as errors here
            reject(err);
        });
        archive.on("error", reject);

        archive.pipe(stream);

        Promise.resolve(addEntriesFn(archive))
            .then(() => archive.finalize())
            .catch(reject);
    });
}