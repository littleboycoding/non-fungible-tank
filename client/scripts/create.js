// Bootstrap new tank

const fs = require("fs");
const path = require("path");

const [, , tankName] = process.argv;

const BASE_PATH = path.join("./public/examples/", tankName);
const ASSETS = path.join(BASE_PATH, "assets");

fs.mkdirSync(BASE_PATH);
fs.mkdirSync(ASSETS);

fs.copyFileSync(
  "./scripts/bootstrap/metadata.json",
  path.join(BASE_PATH, "metadata.json")
);
fs.copyFileSync(
  "./scripts/bootstrap/assets/behavior.js",
  path.join(ASSETS, "behavior.js")
);
