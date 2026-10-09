// Minimal dependency-free lint: JS syntax + a few HTML sanity checks.
import { readFileSync, readdirSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { join } from "node:path";

let failed = 0;
const fail = (m) => { console.error("✗", m); failed++; };

for (const dir of ["js", "tools", "tests"]) {
  for (const f of readdirSync(dir).filter((n) => /\.m?js$/.test(n))) {
    const r = spawnSync(process.execPath, ["--check", join(dir, f)]);
    if (r.status !== 0) fail(`${dir}/${f}: ${r.stderr}`);
  }
}
const html = readFileSync("index.html", "utf8");
const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]);
const dup = ids.filter((id, i) => ids.indexOf(id) !== i);
if (dup.length) fail(`duplicate ids: ${dup.join(", ")}`);
for (const m of html.matchAll(/href="#([^"]+)"/g)) if (!ids.includes(m[1]) && m[1] !== "") fail(`anchor #${m[1]} has no target`);
for (const m of html.matchAll(/<img\b[^>]*>/g)) if (!/\salt=/.test(m[0])) fail(`img without alt: ${m[0].slice(0, 80)}`);
if ((html.match(/<h1\b/g) || []).length !== 1) fail("page must have exactly one <h1>");
console.log(failed ? `${failed} problem(s)` : "lint ok");
process.exit(failed ? 1 : 0);
