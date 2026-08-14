import { spawnSync } from "node:child_process";
import { writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { join } from "node:path";

const require = createRequire(import.meta.url);
const expoCli = require.resolve("expo/bin/cli");
const result = spawnSync(process.execPath, [expoCli, "export", "--platform", "web", "--output-dir", "dist"], {
  stdio: "inherit",
});

if (result.status !== 0) process.exit(result.status ?? 1);

const server = String.raw`const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");
const { URL } = require("node:url");

const root = __dirname;
const port = Number(process.env.PORT || 3000);
const mime = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".ttf": "font/ttf",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
};

http.createServer((request, response) => {
  let pathname;
  try {
    pathname = decodeURIComponent(new URL(request.url || "/", "http://localhost").pathname);
  } catch {
    response.writeHead(400).end("Bad request");
    return;
  }

  const relativePath = pathname === "/" ? "index.html" : pathname.replace(/^\/+/, "");
  let target = path.resolve(root, relativePath);
  if (!target.startsWith(root + path.sep) && target !== root) {
    response.writeHead(403).end("Forbidden");
    return;
  }

  if (!fs.existsSync(target) || fs.statSync(target).isDirectory()) target = path.join(root, "index.html");
  const extension = path.extname(target).toLowerCase();
  response.writeHead(200, { "Content-Type": mime[extension] || "application/octet-stream" });
  fs.createReadStream(target).pipe(response);
}).listen(port, "0.0.0.0");
`;

writeFileSync(join(process.cwd(), "dist", "index.js"), server);
