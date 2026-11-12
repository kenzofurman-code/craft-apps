// Zero-dependency Node.js server for Craft Apps WebAssembly Portal
const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = process.env.PORT || 8080;
const PUBLIC_DIR = path.join(__dirname, "public");

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".wasm": "application/wasm",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
  ".otf": "font/otf",
  ".dxf": "application/dxf",
  ".txt": "text/plain; charset=utf-8"
};

const server = http.createServer((req, res) => {
  // Normalize and sanitize path
  let safePath = path.normalize(decodeURI(req.url.split("?")[0])).replace(/^(\.\.[\/\\])+/, "");
  if (safePath === "/" || safePath === "") {
    safePath = "/index.html";
  }

  let filePath = path.join(PUBLIC_DIR, safePath);

  // If path is a directory, look for index.html inside
  if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
    filePath = path.join(filePath, "index.html");
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      res.end(`404 Not Found: ${req.url}`);
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || "application/octet-stream";

    // Required headers for WebAssembly streaming compilation and WebGPU
    const headers = {
      "Content-Type": contentType,
      "Content-Length": stats.size,
      "Access-Control-Allow-Origin": "*",
      "X-Content-Type-Options": "nosniff"
    };

    // Cache immutable assets like hashed wasm and js
    if (ext === ".wasm" || ext === ".woff2") {
      headers["Cache-Control"] = "public, max-age=31536000, immutable";
    } else if (ext === ".html") {
      headers["Cache-Control"] = "no-cache";
    }

    res.writeHead(200, headers);
    if (req.method === "HEAD") {
      res.end();
      return;
    }

    fs.createReadStream(filePath).pipe(res);
  });
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`====================================================`);
  console.log(`🎨 Craft Apps Suite Portal running at:`);
  console.log(`👉 http://localhost:${PORT}`);
  console.log(`📦 Serving static directory: ${PUBLIC_DIR}`);
  console.log(`⚡ WebAssembly MIME: application/wasm enabled`);
  console.log(`====================================================`);
});
