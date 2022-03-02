require("dotenv/config");

const express = require("express");
const { wss } = require("./wss");
const app = express();

const server = app.listen(process.env.PORT, () => {
  console.log("Listening on %s", process.env.PORT);
});

server.on("upgrade", (request, socket, head) => {
  wss.handleUpgrade(request, socket, head, (ws) => {
    const { searchParams: param } = new URL(request.url, "ws://localhost");
    if (!param.has("address")) ws.close();
    if (!param.has("metadata")) ws.close();

    wss.emit("connection", ws, { ...request, param });
  });
});
