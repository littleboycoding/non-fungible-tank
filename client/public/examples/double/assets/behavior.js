const tank = (chip, tank) => {};

const bullet = (chip, bullet) => {};

let shotTime = null;

const cannon = (chip, cannon) => {
  if (cannon.state.justShoot) {
    setTimeout(() => cannon.shoot(chip), 100);
  }
};

export { tank, cannon, bullet };
