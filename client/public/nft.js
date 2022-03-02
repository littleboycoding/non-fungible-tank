// Entry of game
import Chip from "./chip/index.js";
import setup from "./setup.js";
import loop from "./loop.js";

const canvas = document.getElementById("root");
const chip = new Chip(canvas, setup, loop);
