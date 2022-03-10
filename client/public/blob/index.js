// Collection of reusable blob
import { Blob } from "../chip/index.js";
import { moveAtAngle } from "../chip/utils.js";
import { bulletBehavior } from "./behavior.js";

class Tank extends Blob {
  constructor(
    sprite,
    {
      speed,
      metadata,
      rotateSpeed,
      movingTo = false,
      health,
      cannon,
      playerName,
      clashable,
    }
  ) {
    super("tank", sprite, {
      speed,
      metadata,
      rotateSpeed,
      movingTo,
      health,
      knockback: [],
      cannon,
      playerName,
      hurt: false,
      destructing: false,
      clashable,
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
      justShoot: false,
      hurt: false,
      shoot: false,
    });
  }

  _bulletBlob() {
    const bullet = new Bullet(this.state.bullet, {
      speed: this.state.bulletSpeed,
      damage: this.state.bulletDamage,
      belongTo: this.state.belongTo,
    })
      .addBehavior(bulletBehavior)
      .addBehavior(this.state.bulletBehavior);
    return bullet;
  }

  shoot(chip) {
    const bullet = this._bulletBlob();
    const { x, y } = moveAtAngle(this.sprite.width, this.angle);
    chip.spawn(
      bullet,
      this.x + this.origin.x + x,
      this.y + this.sprite.height / 2 - bullet.sprite.height / 2 + y
    );
    bullet.angle = this.angle;
    bullet.origin = {
      x: 0,
      y: bullet.sprite.height / 2,
    };
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
