/**
 * Минимальный статический сервер без зависимостей.
 *
 * Нужен внутри Docker-образа визуальной регрессии: там нет node_modules
 * репозитория (они собраны под Windows), поэтому поднять `vite preview`
 * нельзя. Отдаёт собранный `dist/storybook`, из которого Playwright
 * открывает изолированные истории по `iframe.html?id=<storyId>`.
 *
 * Использование: node tooling/scripts/serve-static.mjs <корень> <порт>
 */

import { createReadStream, statSync } from "node:fs";
import { createServer } from "node:http";
import path from "node:path";

const rootArg = process.argv[2];
const portArg = process.argv[3];

if (!rootArg || !portArg) {
  console.error("Usage: node tooling/scripts/serve-static.mjs <root-dir> <port>");
  process.exit(1);
}

const root = path.resolve(rootArg);
const port = Number(portArg);

const mimeTypes = {
  ".css": "text/css; charset=utf-8",
  ".gif": "image/gif",
  ".html": "text/html; charset=utf-8",
  ".jpeg": "image/jpeg",
  ".jpg": "image/jpeg",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".map": "application/json; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".ttf": "font/ttf",
  ".txt": "text/plain; charset=utf-8",
  ".webp": "image/webp",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
};

function resolveTarget(requestUrl) {
  const pathname = decodeURIComponent(new URL(requestUrl, "http://127.0.0.1").pathname);
  // path.join нормализует `..`, но сравнение с root защищает от выхода за корень.
  const candidate = path.join(root, pathname);

  if (candidate !== root && !candidate.startsWith(root + path.sep)) {
    return null;
  }

  try {
    const stats = statSync(candidate);
    return stats.isDirectory() ? path.join(candidate, "index.html") : candidate;
  } catch {
    return null;
  }
}

const server = createServer((request, response) => {
  const target = resolveTarget(request.url ?? "/");

  if (!target) {
    response.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
    response.end("Not found");
    return;
  }

  let stats;
  try {
    stats = statSync(target);
  } catch {
    response.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
    response.end("Not found");
    return;
  }

  response.writeHead(200, {
    "cache-control": "no-store",
    "content-length": stats.size,
    "content-type": mimeTypes[path.extname(target).toLowerCase()] ?? "application/octet-stream",
  });

  createReadStream(target).pipe(response);
});

server.listen(port, "127.0.0.1", () => {
  console.log(`serve-static: ${root} -> http://127.0.0.1:${port}`);
});
