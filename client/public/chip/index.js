// Minimal game engine, Chip
import * as utils from "./utils.js";

class Chip {
  constructor(canvas, setup, loop) {
    this.blobs = [];
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.keydown = new Set();
    this.mousedown = new Set();
    this.scene;
    this.loop = loop;
    this.mousePosition = { x: 0, y: 0 };

    setup(this).then(() => {
      this.handleEvent();
      this.render();
    });
  }

  get utils() {
    return utils;
  }

  handleEvent() {
    window.addEventListener("keydown", (e) => {
      // F12, F5 for debugging
      if (e.key === "F12" || e.key === "F5" || e.key === "F11") return;
      this.keydown.add(e.key);
      e.preventDefault();
    });

    window.addEventListener("keyup", (e) => {
      this.keydown.delete(e.key);
      e.preventDefault();
    });

    this.canvas.addEventListener("mousedown", (e) => {
      this.mousedown.add(utils.mouseName(e.button));
      e.preventDefault();
    });

    this.canvas.addEventListener("mouseup", (e) => {
      this.mousedown.delete(utils.mouseName(e.button));
      e.preventDefault();
    });
    this.canvas.addEventListener("mousemove", (e) => {
      this.mousePosition = { x: e.offsetX, y: e.offsetY };
    });

    window.addEventListener("contextmenu", (e) => {
      e.preventDefault();
    });
  }

  queryBlob(name) {
    return this.blobs.filter((b) => b.name === name);
  }

  queryUUID(uuid) {
    const tanks = this.blobs.filter((b) => b.uuid === uuid);
    if (tanks.length === 1) return tanks[0];
  }

  spawn(blob, x, y) {
    if (blob instanceof Blob) {
      blob.x = x;
      blob.y = y;
      this.blobs.push(blob);

      return blob;
    } else if (blob instanceof BlobText) {
      blob.x = x;
      blob.y = y;
      this.blobs.push(blob);
    }
  }

  cleanup() {
    this.blobs = [];
  }

  render() {
    this.loop(this);
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    for (let i = 0; i < this.blobs.length; i++) {
      const blob = this.blobs[i];
      if (blob instanceof Blob) {
        if (blob.destroyed) continue;

        const isOutBound =
          blob.x > this.canvas.width ||
          blob.x + blob.sprite.width < 0 ||
          blob.y > this.canvas.height ||
          blob.y + blob.sprite.height < 0;

        if (blob.name === "bullet" && isOutBound) continue;

        for (let b = 0; b < blob.behavior.length; b++) {
          blob.behavior[b](this, blob, utils);
        }

        this.ctx.translate(blob.x + blob.origin.x, blob.y + blob.origin.y);
        this.ctx.rotate((blob.angle * Math.PI) / 180);
        this.ctx.translate(
          -(blob.x + blob.origin.x),
          -(blob.y + blob.origin.y)
        );

        this.ctx.filter = `opacity(${blob.opacity})`;
        if (blob.state.hurt) this.ctx.filter = "sepia(100%)";
        this.ctx.drawImage(blob.sprite, blob.x, blob.y);
        this.ctx.filter = "sepia(0)";

        this.ctx.setTransform(1, 0, 0, 1, 0, 0);
      } else if (blob instanceof BlobText) {
        if (blob.destroyed) continue;

        for (let b = 0; b < blob.behavior.length; b++) {
          blob.behavior[b](this, blob, utils);
        }

        this.ctx.translate(blob.x + blob.origin.x, blob.y + blob.origin.y);
        this.ctx.rotate((blob.angle * Math.PI) / 180);
        this.ctx.translate(
          -(blob.x + blob.origin.x),
          -(blob.y + blob.origin.y)
        );

        this.ctx.textAlign = blob.textAlign;
        this.ctx.font = blob.font;
        this.ctx.fillStyle = blob.fillStyle;
        this.ctx.fillText(blob.text, blob.x, blob.y);

        this.ctx.setTransform(1, 0, 0, 1, 0, 0);
      }
    }
    requestAnimationFrame(() => this.render());
  }
}

class Blob {
  constructor(name, sprite, state = {}) {
    this.sprite = sprite;
    this.name = name;
    this.behavior = [];
    this.state = state;
    this.x = 0;
    this.y = 0;
    this.opacity = 1;
    this.uuid;
    this.angle = 0;
    this.destroyed = false;
    this.origin = {
      x: 0,
      y: 0,
    };
  }

  addBehavior(behavior) {
    this.behavior.push(behavior);
    return this;
  }

  setAngle(angle) {
    if (angle >= 0 && angle <= 360) this.angle = angle;
    return this;
  }

  incAngle(angle) {
    this.angle =
      this.angle + angle > 360 ? this.angle + angle - 360 : this.angle + angle;
    return this;
  }

  decAngle(angle) {
    this.angle =
      this.angle - angle < 0 ? this.angle - angle + 360 : this.angle - angle;
    return this;
  }
}

class BlobText {
  constructor(name, text, state = {}) {
    this.text = text;
    this.name = name;
    this.behavior = [];
    this.state = state;
    this.textAlign = "start";
    this.fillStyle = "black";
    this.font = "15px Arial";
    this.x = 0;
    this.y = 0;
    this.uuid;
    this.angle = 0;
    this.destroyed = false;
    this.origin = {
      x: 0,
      y: 0,
    };
  }

  addBehavior(behavior) {
    this.behavior.push(behavior);
    return this;
  }

  setAngle(angle) {
    if (angle >= 0 && angle <= 360) this.angle = angle;
    return this;
  }

  incAngle(angle) {
    this.angle =
      this.angle + angle > 360 ? this.angle + angle - 360 : this.angle + angle;
    return this;
  }

  decAngle(angle) {
    this.angle =
      this.angle - angle < 0 ? this.angle - angle + 360 : this.angle - angle;
    return this;
  }
}

export default Chip;
export { Blob, BlobText };
