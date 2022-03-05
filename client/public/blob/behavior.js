// Standard behavior

import { getAngleBetweenPoints, moveAtAngle } from "../chip/utils.js";
import { Bullet } from "./index.js";

function easeOutCubic(x) {
  return 1 - (1 - x) ** 3;
}

function tankBehavior(chip, tank) {
  const shell = chip.shell.players.get(tank.uuid);

  if (tank.state.destructing) return;

  if (shell.mouseDown.has("Left")) {
    tank.moveTo(shell.mousePosition.x, shell.mousePosition.y);
  }

  if (tank.state.movingTo) {
    const translateX = tank.x + tank.sprite.width / 2;
    const translateY = tank.y + tank.sprite.height / 2;
    const offset = tank.state.speed;

    const angle = chip.utils.getAngleBetweenPoints(
      translateX,
      translateY,
      tank.state.movingTo.x,
      tank.state.movingTo.y
    );

    const isTowardAngle =
      angle >= tank.angle - tank.state.rotateSpeed &&
      angle <= tank.angle + tank.state.rotateSpeed;

    if (!isTowardAngle) {
      if (chip.utils.nearestToCounterClockwise(tank.angle, angle))
        tank.decAngle(tank.state.rotateSpeed);
      else tank.incAngle(tank.state.rotateSpeed);
    } else {
      const { x, y } = chip.utils.moveAtAngle(tank.state.speed, angle);

      tank.x += x;
      tank.y += y;
    }

    const isArrived =
      translateX >= tank.state.movingTo.x - offset &&
      translateX <= tank.state.movingTo.x + offset &&
      translateY >= tank.state.movingTo.y - offset &&
      translateY <= tank.state.movingTo.y + offset;

    if (isArrived) tank.state.movingTo = false;
  }

  for (let i = 0; i < tank.state.knockback.length; i++) {
    tank.state.knockback[i].progress -= 0.1;

    const { progress, angle, force } = tank.state.knockback[i];
    const { x, y } = moveAtAngle(easeOutCubic(progress) * force, angle);

    tank.x += x;
    tank.y += y;
  }

  tank.state.knockback = tank.state.knockback.filter((f) => f.progress > 0);

  const tanks = chip.queryBlob("tank");
  for (let i = 0; i < tanks.length; i++) {
    if (tank.uuid !== tanks[i].uuid && chip.utils.isCollision(tank, tanks[i])) {
      tank.state.health = 0;
      tanks[i].state.health = 0;
    }
  }

  if (tank.state.health <= 0 && !tank.state.destructing) {
    tank.state.destructing = 5;
    tank.state.movingTo = false;
    const toggle = () => {
      tank.state.destructing -= 1;
      tank.opacity = tank.opacity === 0 ? 1 : 0;
      if (tank.state.destructing > 0) setTimeout(toggle, 500);
      else {
        tank.destroyed = true;
        tank.state.cannon.destroyed = true;
        tank.state.playerName.destroyed = true;
        setTimeout(() => {
          tank.opacity = 1;
          tank.state.destructing = false;
          tank.state.health = tank.state.metadata.health;
          tank.x = shell.mousePosition.x - tank.sprite.width / 2;
          tank.y = shell.mousePosition.y - tank.sprite.height / 2;
          tank.state.knockback = [];
          tank.destroyed = false;
          tank.state.cannon.destroyed = false;
          tank.state.playerName.destroyed = false;
        }, 1000);
      }
    };
    toggle();
  }
}

function cannonBehavior(chip, cannon) {
  const tank = chip.queryUUID(cannon.state.belongTo);
  const shell = chip.shell.players.get(tank.uuid);

  // Check if tank destroyed
  cannon.destroyed = tank.destroyed;
  cannon.state.hurt = tank.state.hurt;
  cannon.opacity = tank.opacity;
  if (cannon.destroyed) return;
  if (tank.state.destructing) return;

  // Pin cannon to it belong tank
  cannon.x = tank.x + tank.sprite.width / 2 - cannon.origin.x;
  cannon.y = tank.y + tank.sprite.height / 2 - cannon.sprite.height / 2;

  // Rotate to mouse
  cannon.angle = chip.utils.getAngleBetweenPoints(
    cannon.x,
    cannon.y,
    shell.mousePosition.x,
    shell.mousePosition.y
  );

  // Shooting
  if (shell.mouseDown.has("Right") && !cannon.state.reloading) {
    cannon.state.reloading = true;
    cannon.state.justShoot = true;
    const bullet = new Bullet(cannon.state.bullet, {
      speed: cannon.state.bulletSpeed,
      damage: cannon.state.bulletDamage,
      belongTo: cannon.state.belongTo,
    })
      .addBehavior(bulletBehavior)
      .addBehavior(cannon.state.bulletBehavior);

    const { x, y } = chip.utils.moveAtAngle(cannon.sprite.width, cannon.angle);
    chip.spawn(
      bullet,
      cannon.x + cannon.origin.x + x,
      cannon.y + cannon.sprite.height / 2 - bullet.sprite.height / 2 + y
    );
    bullet.angle = cannon.angle;
    bullet.origin = {
      x: 0,
      y: bullet.sprite.height / 2,
    };

    setTimeout(() => {
      cannon.state.reloading = false;
    }, cannon.state.firerate);
  } else {
    cannon.state.justShoot = false;
  }
}

function bulletBehavior(chip, bullet) {
  const tanks = chip.queryBlob("tank");

  const { x, y } = chip.utils.moveAtAngle(bullet.state.speed, bullet.angle);
  bullet.x += x;
  bullet.y += y;

  for (let i = 0; i < tanks.length; i++) {
    const tank = tanks[i];
    if (
      tank.uuid !== bullet.state.belongTo &&
      chip.utils.isCollision(bullet, tank)
    ) {
      tank.state.knockback.push({
        angle: bullet.angle,
        progress: 1,
        force: bullet.state.damage,
      });
      tank.state.hurt = true;
      setTimeout(() => {
        tank.state.hurt = false;
      }, 200);
      tank.state.health -= bullet.state.damage;
      bullet.destroyed = true;
    }
  }
}

function buttonBehavior(chip, button) {
  const hover = chip.utils.isCollision(
    {
      x: chip.mousePosition.x,
      y: chip.mousePosition.y,
      sprite: {
        height: 10,
        width: 10,
      },
    },
    button
  );

  if (hover) {
    button.sprite = button.hover;
    button.hovering = true;
  } else {
    button.sprite = button.notHover;
    button.hovering = false;
  }
}

function playerNameBehavior(chip, name) {
  const tank = chip.queryUUID(name.state.belongTo);

  name.x = tank.x + tank.sprite.width / 2;
  name.y = tank.y - 15;

  name.destroyed = tank.destroyed;
}

export {
  tankBehavior,
  cannonBehavior,
  bulletBehavior,
  buttonBehavior,
  playerNameBehavior,
};
