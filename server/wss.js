const { WebSocketServer } = require("ws");
const { getRandomInt } = require("./utils");

const wss = new WebSocketServer({ noServer: true });

const players = new Map();

wss.on("connection", (ws, req) => {
  ws.addEventListener("message", (event) => {
    const parsed = JSON.parse(event.data);

    switch (parsed.event) {
      case "mouseDown":
        boardcast("mouseDown", parsed.data, req.param.get("address"));
        break;
      case "mouseUp":
        boardcast("mouseUp", parsed.data, req.param.get("address"));
        break;
      case "mouseMove":
        boardcast("mouseMove", parsed.data, req.param.get("address"));
        break;
    }
  });

  ws.addEventListener("close", () => {
    players.delete(req.param.get("address"));
    boardcastFrom(ws, "leave", null, req.param.get("address"));
  });

  onJoin(ws, req);
});

function onJoin(ws, req) {
  const metadata = req.param.get("metadata");
  const address = req.param.get("address");

  players.set(address, metadata);

  let list = [];
  players.forEach((v, k) => {
    list.push({
      address: k,
      metadata: v,
      position: {
        x: getRandomInt(50, 550),
        y: getRandomInt(50, 550),
      },
    });
  });

  boardcast("reset", list);
}

function boardcastFrom(ws, event, data, from) {
  const clients = wss.clients;

  clients.forEach((client) => {
    if (ws !== client) send(client, event, data, from);
  });
}

function boardcast(event, data, from) {
  const clients = wss.clients;

  clients.forEach((client) => {
    send(client, event, data, from);
  });
}

function send(ws, event, data, from = null) {
  const json = JSON.stringify({
    event,
    data,
    from: from,
  });

  ws.send(json);
}

module.exports = { wss };
