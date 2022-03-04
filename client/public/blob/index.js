// Collection of reusable blob
import { Blob } from "../chip/index.js";

class Tank extends Blob {
  constructor(
    sprite,
    { speed, metadata, rotateSpeed, movingTo = false, health, cannon }
  ) {
    super("tank", sprite, {
      speed,
      metadata,
      rotateSpeed,
      movingTo,
      health,
      knockback: [],
      cannon,
      hurt: false,
      destructing: false,
    });
  }

  moveTo(x, y) {
    this.state.movingTo = {
      x,
      y,
    };
    return this;
  }
}

class Cannon extends Blob {
  constructor(
    sprite,
    { bullet, firerate, bulletSpeed, bulletBehavior, bulletDamage, belongTo }
  ) {
    super("cannon", sprite, {
      bullet,
      firerate,
      reloading: false,
      bulletSpeed,
      bulletBehavior,
      bulletDamage,
      belongTo,
      hurt: false,
    });
  }
}

class Bullet extends Blob {
  constructor(sprite, { speed, damage, belongTo }) {
    super("bullet", sprite, {
      speed,
      damage,
      belongTo,
    });
  }
}

export { Tank, Cannon, Bullet };
