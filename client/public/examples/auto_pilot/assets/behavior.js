function randomRange(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

const tank = (chip, tank) => {};

const bullet = (chip, bullet) => {
  // destroyable
  const bullets = chip
    .queryBlob("bullet")
    .filter((b) => b.state.belongTo !== bullet.state.belongTo && !b.destroyed);

  for (let i = 0; i < bullets.length; i++) {
    if (chip.utils.isCollision(bullet, bullets[i])) {
      bullet.destroyed = true;
      bullets[i].destroyed = true;
    }
  }

  if (bullet.state.focus === undefined) {
    const tanks = chip
      .queryBlob("tank")
      .filter((t) => t.uuid !== bullet.state.belongTo);

    const rand = randomRange(0, tanks.length - 1);

    if (tanks[rand]) bullet.state.focus = tanks[rand];
  }

  if (bullet.state.focus !== undefined) {
    const angle = chip.utils.getAngleBetweenPoints(
      bullet.x,
      bullet.y,
      bullet.state.focus.x,
      bullet.state.focus.y
    );
    const clockwise = chip.utils.nearestToCounterClockwise(bullet.angle, angle);
    if (clockwise) {
      bullet.angle -= 1.5;
    } else {
      bullet.angle += 1.5;
    }
  }
};

const cannon = (chip, cannon) => {};

export { tank, cannon, bullet };
