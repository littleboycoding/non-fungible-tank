const tank = (chip, tank) => {
  // Experimental
  const shell = chip.shell.players.get(tank.uuid);

  if (shell.mouseDown.has("Middle")) {
    tank.x = shell.mousePosition.x;
    tank.y = shell.mousePosition.y;
  }
};

const bullet = (chip, bullet) => {};

const cannon = (chip, cannon) => {};

export { tank, cannon, bullet };
