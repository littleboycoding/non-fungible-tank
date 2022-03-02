/**
 * Check if two blob is collisioning or not
 * @param firstObj - first blob
 * @param secondObj - second blob
 * @returns Boolean indicate collsioning
 */
function isCollision(firstObj, secondObj) {
  return !(
    firstObj.y + firstObj.sprite.height < secondObj.y ||
    firstObj.y > secondObj.y + secondObj.sprite.height ||
    firstObj.x + firstObj.sprite.width < secondObj.x ||
    firstObj.x > secondObj.x + secondObj.sprite.width
  );
}

/**
 * Calculate if if counter-clockwise is nearest or not
 * @param angle - current angle
 * @param targetAngle - target angle
 * @param totalDegree - maximum degree
 * @returns Boolean indicate if nearest or not
 */
function nearestToCounterClockwise(angle, targetAngle, totalDegree = 360) {
  const distances = [
    {
      distance: angle - targetAngle,
      counter: true,
    },
    {
      distance: angle + (totalDegree - targetAngle),
      counter: true,
    },
    {
      distance: targetAngle - angle,
      counter: false,
    },
    {
      distance: totalDegree - angle + targetAngle,
      counter: false,
    },
  ]
    .filter((d) => d.distance >= 0)
    .sort((a, b) => a.distance - b.distance)[0];

  return distances.counter;
}

/**
 * Get x,y moving toward angle
 * @param speed - movement speed
 * @param angle - angle (degree) to move toward to
 * @returns Object contain x and y
 */
function moveAtAngle(speed, angle) {
  return {
    x: speed * Math.cos((angle * Math.PI) / 180),
    y: speed * Math.sin((angle * Math.PI) / 180),
  };
}

/**
 * Get mouse button's name from ID
 * @param id - mouse ID
 * @returns mouse button's name
 */
function mouseName(id) {
  switch (id) {
    case 0:
      return "Left";
    case 1:
      return "Middle";
    case 2:
      return "Right";
    default:
      return;
  }
}

/**
 * Get degree of direction
 * @param direction - direction can be 'Left', 'Up', 'Right', 'Down'
 * @returns Angle in degree of direction in number
 */
function directionDegree(direction) {
  switch (direction) {
    case "Left":
      return 0;
    case "Up":
      return 90;
    case "Right":
      return 180;
    case "Down":
      return 270;
    default:
      return 0;
  }
}

/**
 * Get angle between points
 * @param p1x - Position x of first point
 * @param p1y - Position y of first point
 * @param p2x - Position x of second point
 * @param p2y - Position y of second point
 * @returns Angle in degree
 */
function getAngleBetweenPoints(p1x, p1y, p2x, p2y) {
  let theta = (Math.atan2(p2y - p1y, p2x - p1x) * 180) / Math.PI;
  if (theta < 0) theta = 360 + theta;
  return theta;
}

export {
  moveAtAngle,
  directionDegree,
  mouseName,
  getAngleBetweenPoints,
  nearestToCounterClockwise,
  isCollision,
};
