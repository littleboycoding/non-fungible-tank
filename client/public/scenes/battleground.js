import { PlayerShell, wsHandler } from "../utils.js";

// import faker from "https://unpkg.com/@faker-js/faker@6.0.0-alpha.7/dist/esm/index.js?module";

function generateConnectionURL(address, metadata) {
  return `ws://localhost:8080?address=${address}&metadata=${metadata}`;
}

function battleground(chip, address, metadata) {
  console.log("Address %s\nMetadata %s", address, metadata);
  chip.cleanup();
  chip.scene = "battleground";
  const url = generateConnectionURL(address, metadata);
  const ws = new WebSocket(url);
  chip.shell = new PlayerShell(ws, chip);
  wsHandler(chip, ws);
}

export default battleground;
