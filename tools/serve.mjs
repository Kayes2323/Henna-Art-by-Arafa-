// Tiny dependency-free static server for local preview / tests.  Usage: node tools/serve.mjs [port]
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { extname, join, normalize, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(fileURLToPath(new URL("..", import.meta.url)));
const types = { ".html": "text/html; charset=utf-8", ".css": "text/css", ".js": "text/javascript", ".mjs": "text/javascript", ".json": "application/json", ".webp": "image/webp", ".jpg": "image/jpeg", ".png": "image/png", ".mp4": "video/mp4", ".woff2": "font/woff2", ".svg": "image/svg+xml" };

export function start(port = 8080) {
  const server = createServer(async (req, res) => {
    try {
      let p = normalize(decodeURIComponent(new URL(req.url, "http://x").pathname));
      if (p.endsWith("/")) p += "index.html";
      const file = join(root, p);
      if (!file.startsWith(root)) { res.writeHead(403).end(); return; }
      const st = await stat(file);
      const type = types[extname(file)] || "application/octet-stream";
      const range = req.headers.range;
      if (range && type === "video/mp4") {            // Safari needs byte ranges for <video>
        const [s, e] = range.replace("bytes=", "").split("-");
        const start = +s, end = e ? +e : st.size - 1;
        const buf = (await readFile(file)).subarray(start, end + 1);
        res.writeHead(206, { "Content-Type": type, "Content-Range": `bytes ${start}-${end}/${st.size}`, "Accept-Ranges": "bytes", "Content-Length": buf.length });
        res.end(buf); return;
      }
      res.writeHead(200, { "Content-Type": type, "Content-Length": st.size, "Accept-Ranges": "bytes" });
      res.end(await readFile(file));
    } catch { res.writeHead(404).end("Not found"); }
  });
  return new Promise((ok) => server.listen(port, () => ok(server)));
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const port = +process.argv[2] || 8080;
  await start(port);
  console.log(`Serving http://localhost:${port}`);
}
