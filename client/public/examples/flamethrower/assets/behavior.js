const tank = (chip, tank) => {};

const bullet = (chip, bullet) => {
  if (!bullet.state.timeout)
    bullet.state.timeout = setTimeout(() => (bullet.destroyed = true), 500);
};

const cannon = (chip, cannon) => {};

export { tank, cannon, bullet };
