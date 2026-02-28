import { SCALE, TIMING, MOVEMENT } from './constants.js';
import {
  pickNextBehavior,
  shouldJudge,
  shouldKeepBall,
  randomDirection,
  pickRandomTarget,
} from './behaviors.js';

/**
 * Pixel's finite state machine.
 *
 * Each state has an update handler. Transitions happen via enterState().
 * Ball physics and behavior selection are delegated to their own modules;
 * this file only orchestrates state flow and movement.
 *
 * Simple state graph:
 *   WAITING → WALKING ⇄ IDLE/SITTING → RUNNING/LEAVING → GONE → WALKING
 *                                          ↕ (ball throw)
 *                              WATCHING → CHASING → PICKUP → RETURNING → DROP → IDLE
 */

export const State = {
  WAITING: 'waiting',
  WALKING: 'walking',
  IDLE: 'idle',
  BARKING: 'barking',
  SITTING: 'sitting',
  RUNNING: 'running',
  LEAVING: 'leaving',
  GONE: 'gone',
  WATCHING_BALL: 'watching_ball',
  CHASING_BALL: 'chasing_ball',
  PICKING_UP: 'picking_up',
  RETURNING_BALL: 'returning_ball',
  DROPPING_BALL: 'dropping_ball',
};

export function createPixelState({
  sprites,
  ball,
  getCanvasWidth,
  spriteWidth,
  spriteHeight,
}) {
  const scaledW = spriteWidth * SCALE;

  let state = State.WAITING;
  let prev = State.IDLE;
  let timer = 0;
  let x = -scaledW;
  let dir = 1;
  let targetX = null;
  let returnX = 100;
  let ballHeld = false;

  function maxX() {
    return getCanvasWidth() - scaledW;
  }
  function offScreen() {
    return x > maxX() + scaledW || x < -scaledW;
  }
  function reachedTarget() {
    return targetX !== null && (dir === 1 ? x >= targetX : x <= targetX);
  }
  function reachedBall() {
    return Math.abs(x + scaledW / 2 - ball.x) < 30;
  }
  function reachedReturn() {
    return Math.abs(x - returnX) < 30;
  }

  // --- Sprite-to-state mapping ---
  const spriteMap = {
    [State.WALKING]: sprites.walk,
    [State.IDLE]: sprites.idle,
    [State.BARKING]: sprites.sitBark,
    [State.SITTING]: sprites.sit,
    [State.RUNNING]: sprites.run,
    [State.LEAVING]: sprites.walk,
    [State.WATCHING_BALL]: sprites.idle,
    [State.CHASING_BALL]: sprites.run,
    [State.PICKING_UP]: sprites.pickUpBall,
    [State.RETURNING_BALL]: sprites.walkBall,
    [State.DROPPING_BALL]: sprites.pickUpBall,
  };

  // --- State transitions ---

  function enterState(next) {
    prev = state;
    state = next;
    timer = 0;

    // Reset relevant animation on enter
    spriteMap[next]?.reset();

    if (next === State.IDLE) {
      // Drop ball if she was holding it
      if (ballHeld) {
        ballHeld = false;
        ball.drop(x + scaledW / 2);
      }
      // Swap idle sprite variant for personality
      spriteMap[State.IDLE] = shouldJudge() ? sprites.idleSniff : sprites.idle;
      spriteMap[State.IDLE].reset();
    }
  }

  function doNextBehavior() {
    const action = pickNextBehavior(ballHeld);
    if (action.type === 'walk') {
      targetX = pickRandomTarget(maxX());
      dir = targetX > x ? 1 : -1;
      enterState(State.WALKING);
    } else if (action.type === 'run_offscreen') {
      dir = randomDirection();
      enterState(State.RUNNING);
    } else {
      dir = randomDirection();
      enterState(State.LEAVING);
    }
  }

  function enterFromOffscreen(targetState) {
    dir = ball.x > getCanvasWidth() / 2 ? 1 : -1;
    x = dir === 1 ? -scaledW : getCanvasWidth() + scaledW;
    enterState(targetState);
  }

  // --- Per-state update handlers ---

  const handlers = {
    [State.WAITING](dt) {
      if (ball.thrown) {
        enterFromOffscreen(
          ball.inMotion ? State.WATCHING_BALL : State.CHASING_BALL,
        );
        return;
      }
      if (timer >= TIMING.ENTRANCE_DELAY) {
        targetX = pickRandomTarget(maxX());
        dir = 1;
        enterState(State.WALKING);
      }
    },

    [State.WALKING](dt) {
      x += MOVEMENT.WALK_SPEED * dt * dir;
      if (reachedTarget()) {
        x = Math.max(0, Math.min(targetX, maxX()));
        enterState(Math.random() < 0.3 ? State.SITTING : State.IDLE);
      } else if (Math.random() < 0.002) {
        enterState(State.SITTING);
      }
    },

    [State.IDLE]() {
      if (timer >= TIMING.IDLE_DURATION) doNextBehavior();
    },
    [State.SITTING]() {
      if (timer >= TIMING.SIT_DURATION) doNextBehavior();
    },
    [State.BARKING]() {
      if (timer >= TIMING.BARK_DURATION) enterState(prev);
    },

    [State.RUNNING](dt) {
      x += MOVEMENT.RUN_SPEED * dt * dir;
      if (offScreen()) enterState(State.GONE);
    },

    [State.LEAVING](dt) {
      x += MOVEMENT.WALK_SPEED * dt * dir;
      if (offScreen()) enterState(State.GONE);
    },

    [State.GONE]() {
      if (ball.thrown && !ball.inMotion) {
        enterFromOffscreen(State.CHASING_BALL);
        return;
      }
      if (timer >= TIMING.GONE_DURATION) {
        dir = randomDirection();
        x = dir === 1 ? -scaledW : getCanvasWidth() + scaledW;
        targetX = pickRandomTarget(maxX());
        enterState(State.WALKING);
      }
    },

    [State.WATCHING_BALL]() {
      dir = ball.x > x + scaledW / 2 ? 1 : -1;
      if (!ball.inMotion) enterState(State.CHASING_BALL);
    },

    [State.CHASING_BALL](dt) {
      dir = ball.x > x + scaledW / 2 ? 1 : -1;
      x += MOVEMENT.RUN_SPEED * dt * dir;
      if (reachedBall()) enterState(State.PICKING_UP);
    },

    [State.PICKING_UP]() {
      if (timer >= TIMING.PICKUP_DURATION) {
        ballHeld = true;
        ball.pickUp();
        enterState(shouldKeepBall() ? State.IDLE : State.RETURNING_BALL);
      }
    },

    [State.RETURNING_BALL](dt) {
      dir = returnX > x ? 1 : -1;
      x += MOVEMENT.WALK_SPEED * dt * dir;
      if (timer >= TIMING.RETURN_MIN_WALK && reachedReturn())
        enterState(State.DROPPING_BALL);
    },

    [State.DROPPING_BALL]() {
      if (timer >= TIMING.DROP_DURATION) {
        ballHeld = false;
        ball.drop(x + scaledW / 2);
        enterState(State.IDLE);
      }
    },
  };

  // --- Public API ---

  return {
    update(deltaTime) {
      timer += deltaTime;
      handlers[state]?.(deltaTime);
    },

    bark() {
      if (
        state !== State.WAITING &&
        state !== State.BARKING &&
        state !== State.GONE
      ) {
        enterState(State.BARKING);
      }
    },

    /** Set the return target and start watching (or queue for when she's back). */
    onBallThrown(fromX) {
      returnX = x < 0 || x > getCanvasWidth() ? getCanvasWidth() / 2 : fromX;
      if (state !== State.WAITING && state !== State.GONE)
        enterState(State.WATCHING_BALL);
    },

    /** Hit test against Pixel's bounding box. */
    containsPoint(px, py, pixelY) {
      if (state === State.WAITING || state === State.GONE) return false;
      return (
        px >= x &&
        px <= x + scaledW &&
        py >= pixelY &&
        py <= pixelY + spriteHeight * SCALE
      );
    },

    getActiveSprite() {
      return spriteMap[state] ?? null;
    },
    getX() {
      return x;
    },
    getDirection() {
      return dir;
    },
  };
}
