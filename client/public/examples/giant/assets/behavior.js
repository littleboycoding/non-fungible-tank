const tank = (chip, tank) => {
  tank.state.knockback = [];
  tank.state.clashable = false;
  if (tank.state.health < tank.state.metadata.health) tank.state.health += 0.05;

  const tanks = chip.queryBlob("tank").filter((t) => t.uuid !== tank.uuid);

  for (let i = 0; i < tanks.length; i++) {
    if (
      tanks[i].state.clashable &&
      chip.utils.isCollision(tank, tanks[i], 50)
    ) {
      const angle = chip.utils.getAngleBetweenPoints(
        tank.x,
        tank.y,
        tanks[i].x,
        tanks[i].y
      );
      const { x, y } = chip.utils.moveAtAngle(15, angle);
      tanks[i].x += x;
      tanks[i].y += y;
      tanks[i].state.health = 0;
    }
  }
};

const bullet = (chip, bullet) => {};

const cannon = (chip, cannon) => {};

export { tank, cannon, bullet };
