import { Cannon, Tank } from "./blob/index.js";
import { tankBehavior, cannonBehavior } from "./blob/behavior.js";

function fetchAsBitmap(url) {
  return fetch(url)
    .then((res) => res.blob())
    .then((blob) => createImageBitmap(blob));
}

function verifyMetadata(metadata) {
  const behavior =
    metadata.behavior.cannon &&
    metadata.behavior.bullet &&
    metadata.behavior.tank;
  const bitmap =
    metadata.bitmap.cannon && metadata.bitmap.bullet && metadata.bitmap.body;
  const attribute =
    metadata.health &&
    metadata.speed &&
    metadata.rotateSpeed &&
    metadata.projectileSpeed &&
    metadata.firerate &&
    metadata.cannonOrigin?.x &&
    metadata.cannonOrigin?.y;

  return behavior && bitmap && attribute;
}

/**
 * Get tank data from metadata
 */
async function fromMetadata(url) {
  const json = await fetch(url).then((res) => res.json());
  const assets = json.assets;

  const bitmap = {
    body: await fetch(assets.body)
      .then((res) => res.blob())
      .then((blob) => createImageBitmap(blob)),
    cannon: await fetch(assets.cannon)
      .then((res) => res.blob())
      .then((blob) => createImageBitmap(blob)),
    bullet: await fetch(assets.bullet)
      .then((res) => res.blob())
      .then((blob) => createImageBitmap(blob)),
  };

  const behavior = await import(assets.behavior);

  const result = {
    ...json,
    bitmap,
    behavior,
  };

  if (!verifyMetadata(result)) throw new Error("Metadata is invalid");

  return result;
}

async function spawnAt(chip, address, metadata, x, y) {
  const { bitmap, behavior } = metadata;

  const tank = new Tank(bitmap.body, {
    metadata,
    health: metadata.health,
    speed: metadata.speed,
    rotateSpeed: metadata.rotateSpeed,
  })
    .addBehavior(tankBehavior)
    .addBehavior(behavior.tank);
  chip.spawn(tank, x, y);
  tank.origin = {
    x: tank.sprite.width / 2,
    y: tank.sprite.height / 2,
  };
  tank.uuid = address;

  const cannon = new Cannon(bitmap.cannon, {
    bullet: bitmap.bullet,
    firerate: metadata.firerate,
    bulletBehavior: behavior.bullet,
    bulletDamage: metadata.damage,
    bulletSpeed: metadata.projectileSpeed,
    belongTo: address,
  })
    .addBehavior(cannonBehavior)
    .addBehavior(behavior.cannon);
  chip.spawn(cannon, tank.x, tank.y);
  cannon.origin = {
    x: metadata.cannonOrigin.x,
    y: metadata.cannonOrigin.y,
  };

  return { tank, cannon };
}

function wsHandler(chip, ws) {
  ws.addEventListener("message", (e) => {
    const { event, data, from } = JSON.parse(e.data);

    switch (event) {
      case "reset":
        chip.cleanup();
        for (let i = 0; i < data.length; i++) {
          const { address, metadata, position } = data[i];
          fromMetadata(metadata).then((m) => {
            spawnAt(chip, address, m, position.x, position.y);
            chip.shell.add(address);
          });
        }
        break;
      case "leave":
        const tank = chip.queryUUID(from);
        if (tank) tank.destroyed = true;
        chip.shell.leave(from);
    }
  });
}

class PlayerShell {
  constructor(ws, chip) {
    this.players = new Map();
    this.chip = chip;

    this.handleEvent(ws);
  }

  handleEvent(ws) {
    this.chip.canvas.addEventListener("mousedown", (event) => {
      if (ws.readyState === ws.OPEN)
        ws.send(
          JSON.stringify({
            event: "mouseDown",
            data: {
              button: this.chip.utils.mouseName(event.button),
            },
          })
        );
    });
    this.chip.canvas.addEventListener("mouseup", (event) => {
      if (ws.readyState === ws.OPEN)
        ws.send(
          JSON.stringify({
            event: "mouseUp",
            data: {
              button: this.chip.utils.mouseName(event.button),
            },
          })
        );
    });
    this.chip.canvas.addEventListener("mousemove", (event) => {
      if (ws.readyState === ws.OPEN)
        ws.send(
          JSON.stringify({
            event: "mouseMove",
            data: {
              x: event.offsetX,
              y: event.offsetY,
            },
          })
        );
    });
    ws.addEventListener("message", (e) => {
      const { event, data, from } = JSON.parse(e.data);

      const player = this.players.get(from);

      if (!player) return;

      switch (event) {
        case "mouseDown":
          player.mouseDown.add(data.button);
          break;
        case "mouseUp":
          player.mouseDown.delete(data.button);
          break;
        case "mouseMove":
          player.mousePosition = {
            x: data.x,
            y: data.y,
          };
          break;
      }
    });
  }

  add(address) {
    this.players.set(address, {
      mouseDown: new Set(),
      mousePosition: {
        x: 0,
        y: 0,
      },
      keyDown: new Set(), // Might get deprecated soon
    });
  }

  leave(address) {
    this.players.delete(address);
  }
}

export { fromMetadata, spawnAt, PlayerShell, wsHandler, fetchAsBitmap };
