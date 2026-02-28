import { BALL_PHYSICS, SCALE } from './constants.js';

const { GRAVITY, BOUNCE, FRICTION, MIN_VELOCITY } = BALL_PHYSICS;

/**
 * Ball state and physics simulation.
 */
export function createBall({ ballWidth, groundY, getCanvasWidth }) {
  const size = ballWidth * SCALE;

  let x = 100;
  let y = groundY;
  let vx = 0;
  let vy = 0;
  let visible = true;
  let held = false;
  let thrown = false;
  let inMotion = false;

  function update(deltaTime) {
    if (!inMotion) return;

    vy += GRAVITY * deltaTime;
    x += vx * deltaTime;
    y += vy * deltaTime;

    // Ground bounce
    if (y >= groundY) {
      y = groundY;
      vy = -vy * BOUNCE;
      vx *= FRICTION;
      if (Math.abs(vy) < MIN_VELOCITY) vy = 0;
    }

    vx *= FRICTION;

    // Wall bounces
    const maxX = getCanvasWidth() - size;
    if (x < 0) {
      x = 0;
      vx = -vx * BOUNCE;
    } else if (x > maxX) {
      x = maxX;
      vx = -vx * BOUNCE;
    }

    // Settle
    if (
      Math.abs(vx) < MIN_VELOCITY &&
      Math.abs(vy) < MIN_VELOCITY &&
      y >= groundY - 1
    ) {
      inMotion = false;
      vx = 0;
      vy = 0;
      y = groundY;
    }
  }

  /** Launch the ball with initial velocity. */
  function launch(startX, velocityX, velocityY) {
    x = startX;
    vx = velocityX;
    vy = velocityY;
    inMotion = true;
    thrown = true;
    visible = true;
    held = false;
  }

  /** Pixel picks up the ball - hide it. */
  function pickUp() {
    held = true;
    visible = false;
  }

  /** Pixel drops the ball at a position. */
  function drop(dropX) {
    held = false;
    visible = true;
    thrown = false;
    x = dropX;
    y = groundY;
  }

  /** Hit test */
  function containsPoint(px, py) {
    if (!visible || held || inMotion) return false;
    const hitSize = size * 3;
    return (
      px >= x - hitSize &&
      px <= x + hitSize &&
      py >= y - hitSize &&
      py <= y + hitSize
    );
  }

  return {
    update,
    launch,
    pickUp,
    drop,
    containsPoint,
    get x() {
      return x;
    },
    get y() {
      return y;
    },
    get size() {
      return size;
    },
    get visible() {
      return visible && !held;
    },
    get thrown() {
      return thrown;
    },
    get inMotion() {
      return inMotion;
    },
    /** Can the ball be thrown right now? */
    get throwable() {
      return !held && !thrown && !inMotion;
    },
  };
}
