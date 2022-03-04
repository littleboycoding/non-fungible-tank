import { PlayerShell, wsHandler } from "../utils.js";

function generateConnectionURL(address, metadata) {
  return `ws://localhost:5050?address=${address}&metadata=${metadata}`;
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
