const http = require("http");
const fs = require("fs");
const path = require("path");

const root = __dirname;
const types = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
};

http
  .createServer((req, res) => {
    let requested = decodeURIComponent(req.url.split("?")[0]);
    if (requested === "/") requested = "/index.html";

    const filePath = path.normalize(path.join(root, requested));
    if (!filePath.startsWith(root)) {
      res.writeHead(403);
      res.end("Forbidden");
      return;
    }

    fs.readFile(filePath, (error, data) => {
      if (error) {
        res.writeHead(404);
        res.end("Not found");
        return;
      }

      res.writeHead(200, {
        "Content-Type": types[path.extname(filePath)] || "text/plain; charset=utf-8",
      });
      res.end(data);
    });
  })
  .listen(4173, "127.0.0.1", () => {
    console.log("Agentex on http://127.0.0.1:4173");
  });
