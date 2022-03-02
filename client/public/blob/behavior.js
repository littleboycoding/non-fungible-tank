// Standard behavior

import { Bullet } from "./index.js";

function tankBehavior(chip, tank) {
  const shell = chip.shell.players.get(tank.uuid);

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
      return;
    }

    const { x, y } = chip.utils.moveAtAngle(tank.state.speed, angle);

    tank.x += x;
    tank.y += y;

    const isArrived =
      translateX >= tank.state.movingTo.x - offset &&
      translateX <= tank.state.movingTo.x + offset &&
      translateY >= tank.state.movingTo.y - offset &&
      translateY <= tank.state.movingTo.y + offset;

    if (isArrived) tank.state.movingTo = false;
  }
}

function cannonBehavior(chip, cannon) {
  const tank = chip.queryUUID(cannon.state.belongTo);
  const shell = chip.shell.players.get(tank.uuid);

  // Check if tank destroyed
  if (tank.destroyed) {
    return (cannon.destroyed = true);
  }

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
      x: bullet.sprite.width / 2,
      y: bullet.sprite.height / 2,
    };

    setTimeout(() => {
      cannon.state.reloading = false;
    }, cannon.state.firerate);
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
      chip.utils.isCollision(bullet, tank) &&
      !tank.destroyed
    ) {
      tank.health -= bullet.state.damage;
      bullet.destroyed = true;
    }
  }
}

export { tankBehavior, cannonBehavior, bulletBehavior };
