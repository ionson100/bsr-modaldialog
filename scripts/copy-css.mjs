// Cross platform replacement for the previous Windows only
// `@powershell copy` command used by the build script.
import {copyFileSync, mkdirSync} from "node:fs";
import {dirname, resolve} from "node:path";
import {fileURLToPath} from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const from = resolve(root, "src/modal/index.css");
const to = resolve(root, "dist/index.css");

mkdirSync(dirname(to), {recursive: true});
copyFileSync(from, to);

console.log(`copied ${from} -> ${to}`);
