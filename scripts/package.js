import { execFile } from "node:child_process";
import { mkdir, readFile, rm } from "node:fs/promises";
import { resolve } from "node:path";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);
const rootDirectory = resolve(import.meta.dirname, "..");
const manifestPath = resolve(rootDirectory, "dist/manifest.json");
const releaseDirectory = resolve(rootDirectory, "release");

const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
const archivePath = resolve(releaseDirectory, `ad-giri-v${manifest.version}.zip`);

await mkdir(releaseDirectory, { recursive: true });
await rm(archivePath, { force: true });

await execFileAsync("zip", ["-r", "-q", "-X", archivePath, "."], {
  cwd: resolve(rootDirectory, "dist"),
});

console.log(`Created ${archivePath}`);
