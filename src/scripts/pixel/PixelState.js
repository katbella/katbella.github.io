/**
 * Pixel's state machine.
 * Manages her behavior: entering, walking, idling, barking, sitting, running,
 * leaving, and ball interactions.
 */

const States = {
  WAITING: 'waiting', // Before she appears
  WALKING: 'walking', // Walking to a target
  IDLE: 'idle', // Standing still
  BARKING: 'barking', // Sitting and barking (from click)
  SITTING: 'sitting', // Just sitting
  RUNNING: 'running', // Running across screen
  LEAVING: 'leaving', // Walking off screen
  GONE: 'gone', // Off screen, will return
  WATCHING_BALL: 'watching_ball', // Watching ball fly through air
  CHASING_BALL: 'chasing_ball', // Running after the ball
  PICKING_UP_BALL: 'picking_up_ball', // Picking up the ball
  RETURNING_BALL: 'returning_ball', // Walking back with ball
  DROPPING_BALL: 'dropping_ball', // Dropping the ball
};

const Config = {
  // Timing (ms)
  ENTRANCE_DELAY: 5000,
  IDLE_DURATION: 2000,
  SIT_DURATION: 3000,
  BARK_DURATION: 600,
  GONE_DURATION: 10000,
  PICKUP_DURATION: 500,
  DROP_DURATION: 500,

  // Movement (pixels per ms)
  WALK_SPEED: 0.15,
  RUN_SPEED: 0.3,

  // Display
  SCALE: 2,

  // Behavior
  STUBBORN_CHANCE: 0.2, // Chance she keeps the ball
  JUDGE_CHANCE: 0.15, // Chance she does the judgmental stare

  // Ball physics
  BALL_GRAVITY: 0.001,
  BALL_BOUNCE: 0.6,
  BALL_FRICTION: 0.98,
  BALL_MIN_VELOCITY: 0.01,
};

export function createPixelState({
  sprites,
  getCanvasWidth,
  spriteWidth,
  spriteHeight,
  ballWidth,
  groundY,
}) {
  // ============================================
  // State
  // ============================================
  let state = States.WAITING;
  let previousState = States.IDLE;
  let timer = 0;

  // Position
  let x = -spriteWidth * Config.SCALE; // Start off-screen
  let direction = 1; // 1 = right, -1 = left
  let targetX = null;

  // Ball
  let ballX = 100;
  let ballY = groundY;
  let ballVelocityX = 0;
  let ballVelocityY = 0;
  let ballVisible = true;
  let ballHeld = false;
  let ballThrown = false;
  let ballInMotion = false;
  let returnX = 100;

  // Pre-calculated dimensions
  const scaledWidth = spriteWidth * Config.SCALE;
  const scaledHeight = spriteHeight * Config.SCALE;
  const scaledBallSize = ballWidth * Config.SCALE;

  // ============================================
  // Sprite mapping
  // ============================================
  const spriteMap = {
    [States.WAITING]: null,
    [States.WALKING]: sprites.walk,
    [States.IDLE]: sprites.idle,
    [States.BARKING]: sprites.sitBark,
    [States.SITTING]: sprites.sit,
    [States.RUNNING]: sprites.run,
    [States.LEAVING]: sprites.walk,
    [States.GONE]: null,
    [States.WATCHING_BALL]: sprites.idle,
    [States.CHASING_BALL]: sprites.run,
    [States.PICKING_UP_BALL]: sprites.pickUpBall,
    [States.RETURNING_BALL]: sprites.walkBall,
    [States.DROPPING_BALL]: sprites.pickUpBall,
  };

  // ============================================
  // Helpers
  // ============================================

  /**
   * Get canvas width, clamped to valid range.
   */
  function getMaxX() {
    return getCanvasWidth() - scaledWidth;
  }

  /**
   * Pick a random X position, avoiding edges.
   */
  function pickRandomTarget() {
    const maxX = getMaxX();
    const margin = maxX * 0.1;
    return margin + Math.random() * (maxX - margin * 2);
  }

  /**
   * Pick what to do next after idling/sitting.
   */
  function pickNextBehavior() {
    // If holding ball, just walk around — don't leave
    if (ballHeld) {
      targetX = pickRandomTarget();
      direction = targetX > x ? 1 : -1;
      enterState(States.WALKING);
      return;
    }

    const roll = Math.random();

    if (roll < 0.1) {
      // 10%: Run off screen
      direction = Math.random() < 0.5 ? 1 : -1;
      enterState(States.RUNNING);
    } else if (roll < 0.25) {
      // 15%: Walk off screen
      direction = Math.random() < 0.5 ? 1 : -1;
      enterState(States.LEAVING);
    } else {
      // 75%: Walk to random spot
      targetX = pickRandomTarget();
      direction = targetX > x ? 1 : -1;
      enterState(States.WALKING);
    }
  }

  /**
   * Check if Pixel is off screen.
   */
  function isOffScreen() {
    return x > getMaxX() + scaledWidth || x < -scaledWidth;
  }

  /**
   * Check if Pixel has reached her target.
   */
  function hasReachedTarget() {
    if (targetX === null) return false;
    return (
      (direction === 1 && x >= targetX) || (direction === -1 && x <= targetX)
    );
  }

  /**
   * Check if Pixel has reached the ball.
   */
  function hasReachedBall() {
    const dist = Math.abs(x + scaledWidth / 2 - ballX);
    return dist < 30;
  }

  /**
   * Check if Pixel has reached the return position.
   */
  function hasReachedReturn() {
    return Math.abs(x - returnX) < 30;
  }

  // ============================================
  // Ball physics
  // ============================================

  function updateBall(deltaTime) {
    if (!ballInMotion) return;

    // Gravity
    ballVelocityY += Config.BALL_GRAVITY * deltaTime;

    // Move
    ballX += ballVelocityX * deltaTime;
    ballY += ballVelocityY * deltaTime;

    // Bounce off ground
    if (ballY >= groundY) {
      ballY = groundY;
      ballVelocityY = -ballVelocityY * Config.BALL_BOUNCE;
      ballVelocityX *= Config.BALL_FRICTION;

      if (Math.abs(ballVelocityY) < Config.BALL_MIN_VELOCITY) {
        ballVelocityY = 0;
      }
    }

    // Friction
    ballVelocityX *= Config.BALL_FRICTION;

    // Bounce off walls
    const maxBallX = getCanvasWidth() - scaledBallSize;
    if (ballX < 0) {
      ballX = 0;
      ballVelocityX = -ballVelocityX * Config.BALL_BOUNCE;
    } else if (ballX > maxBallX) {
      ballX = maxBallX;
      ballVelocityX = -ballVelocityX * Config.BALL_BOUNCE;
    }

    // Stop when settled
    const settled =
      Math.abs(ballVelocityX) < Config.BALL_MIN_VELOCITY &&
      Math.abs(ballVelocityY) < Config.BALL_MIN_VELOCITY &&
      ballY >= groundY - 1;

    if (settled) {
      ballInMotion = false;
      ballVelocityX = 0;
      ballVelocityY = 0;
      ballY = groundY;
    }
  }

  // ============================================
  // State transitions
  // ============================================

  function enterState(newState) {
    previousState = state;
    state = newState;
    timer = 0;

    // Reset animations for certain states
    switch (newState) {
      case States.BARKING:
        sprites.sitBark.reset();
        break;

      case States.SITTING:
        sprites.sit.reset();
        break;

      case States.PICKING_UP_BALL:
        sprites.pickUpBall.reset();
        break;

      case States.IDLE:
        // If stubborn with ball, drop it
        if (ballHeld) {
          ballHeld = false;
          ballVisible = true;
          ballX = x + scaledWidth / 2;
          ballY = groundY;
          ballThrown = false;
        }
        // Random chance of judgmental stare
        spriteMap[States.IDLE] =
          Math.random() < Config.JUDGE_CHANCE
            ? sprites.idleSniff
            : sprites.idle;
        spriteMap[States.IDLE].reset();
        break;
    }
  }

  /**
   * State update handlers.
   */
  const stateHandlers = {
    [States.WAITING]: () => {
      // Come back early if ball was thrown
      if (ballThrown && !ballInMotion) {
        targetX = pickRandomTarget();
        direction = 1;
        enterState(States.CHASING_BALL);
        return;
      }

      if (timer >= Config.ENTRANCE_DELAY) {
        targetX = pickRandomTarget();
        direction = 1;
        enterState(States.WALKING);
      }
    },

    [States.WALKING]: (dt) => {
      x += Config.WALK_SPEED * dt * direction;

      if (hasReachedTarget()) {
        x = Math.max(0, Math.min(targetX, getMaxX()));
        enterState(Math.random() < 0.3 ? States.SITTING : States.IDLE);
      } else if (Math.random() < 0.002) {
        // Random chance to stop and sit
        enterState(States.SITTING);
      }
    },

    [States.IDLE]: () => {
      if (timer >= Config.IDLE_DURATION) {
        pickNextBehavior();
      }
    },

    [States.SITTING]: () => {
      if (timer >= Config.SIT_DURATION) {
        pickNextBehavior();
      }
    },

    [States.BARKING]: () => {
      if (timer >= Config.BARK_DURATION) {
        enterState(previousState);
      }
    },

    [States.RUNNING]: (dt) => {
      x += Config.RUN_SPEED * dt * direction;
      if (isOffScreen()) {
        enterState(States.GONE);
      }
    },

    [States.LEAVING]: (dt) => {
      x += Config.WALK_SPEED * dt * direction;
      if (isOffScreen()) {
        enterState(States.GONE);
      }
    },

    [States.GONE]: () => {
      // Come back if ball was thrown and landed
      if (ballThrown && !ballInMotion) {
        direction = ballX > getCanvasWidth() / 2 ? 1 : -1;
        x = direction === 1 ? -scaledWidth : getCanvasWidth() + scaledWidth;
        enterState(States.CHASING_BALL);
        return;
      }

      if (timer >= Config.GONE_DURATION) {
        direction = Math.random() < 0.5 ? 1 : -1;
        x = direction === 1 ? -scaledWidth : getCanvasWidth() + scaledWidth;
        targetX = pickRandomTarget();
        enterState(States.WALKING);
      }
    },

    [States.WATCHING_BALL]: () => {
      // Look toward ball
      direction = ballX > x + scaledWidth / 2 ? 1 : -1;

      // Chase once ball stops
      if (!ballInMotion) {
        enterState(States.CHASING_BALL);
      }
    },

    [States.CHASING_BALL]: (dt) => {
      direction = ballX > x + scaledWidth / 2 ? 1 : -1;
      x += Config.RUN_SPEED * dt * direction;

      if (hasReachedBall()) {
        enterState(States.PICKING_UP_BALL);
      }
    },

    [States.PICKING_UP_BALL]: () => {
      if (timer >= Config.PICKUP_DURATION) {
        ballHeld = true;
        ballVisible = false;

        // Sometimes stubborn — keeps the ball
        if (Math.random() < Config.STUBBORN_CHANCE) {
          enterState(States.IDLE);
        } else {
          enterState(States.RETURNING_BALL);
        }
      }
    },

    [States.RETURNING_BALL]: (dt) => {
      // Must walk for at least 500ms before dropping
      if (timer < 500) {
        direction = returnX > x ? 1 : -1;
        x += Config.WALK_SPEED * dt * direction;
        return;
      }

      direction = returnX > x ? 1 : -1;
      x += Config.WALK_SPEED * dt * direction;

      if (hasReachedReturn()) {
        enterState(States.DROPPING_BALL);
      }
    },

    [States.DROPPING_BALL]: () => {
      if (timer >= Config.DROP_DURATION) {
        ballHeld = false;
        ballVisible = true;
        ballX = x + scaledWidth / 2;
        ballY = groundY;
        ballThrown = false;
        enterState(States.IDLE);
      }
    },
  };

  // ============================================
  // Public API
  // ============================================

  function update(deltaTime) {
    timer += deltaTime;
    updateBall(deltaTime);
    stateHandlers[state]?.(deltaTime);
  }

  /**
   * Make Pixel bark (triggered by clicking on her).
   */
  function bark() {
    const canBark =
      state !== States.WAITING &&
      state !== States.BARKING &&
      state !== States.GONE;
    if (canBark) {
      enterState(States.BARKING);
    }
  }

  /**
   * Throw the ball (triggered by drag-release).
   */
  function throwBall(toX, velocityX, velocityY) {
    if (ballHeld || ballThrown || ballInMotion) return;

    ballX = toX;
    ballVelocityX = velocityX;
    ballVelocityY = velocityY;
    ballInMotion = true;
    ballThrown = true;

    // Return ball to where the throw started, not where it landed
    // This is already set to x (Pixel's position) when throw happens
    // But if Pixel is off-screen, pick a spot on screen
    if (x < 0 || x > getCanvasWidth()) {
      returnX = getCanvasWidth() / 2;
    } else {
      returnX = x;
    }

    const canWatch = state !== States.WAITING && state !== States.GONE;
    if (canWatch) {
      enterState(States.WATCHING_BALL);
    }
  }

  /**
   * Check if point is inside Pixel (for click detection).
   */
  function containsPoint(px, py, pixelY) {
    const visible = state !== States.WAITING && state !== States.GONE;
    if (!visible) return false;

    return (
      px >= x &&
      px <= x + scaledWidth &&
      py >= pixelY &&
      py <= pixelY + scaledHeight
    );
  }

  /**
   * Check if point is inside ball (for drag detection).
   */
  function ballContainsPoint(px, py) {
    if (!ballVisible || ballHeld || ballInMotion) return false;

    // Generous hit area
    const hitSize = scaledBallSize * 3;
    return (
      px >= ballX - hitSize &&
      px <= ballX + hitSize &&
      py >= ballY - hitSize &&
      py <= ballY + hitSize
    );
  }

  function getActiveSprite() {
    return spriteMap[state];
  }

  function getX() {
    return x;
  }

  function getDirection() {
    return direction;
  }

  function isVisible() {
    return state !== States.WAITING && state !== States.GONE;
  }

  function getBallX() {
    return ballX;
  }

  function getBallY() {
    return ballY;
  }

  function isBallVisible() {
    return ballVisible && !ballHeld;
  }

  return {
    update,
    bark,
    throwBall,
    containsPoint,
    ballContainsPoint,
    getActiveSprite,
    getX,
    getDirection,
    isVisible,
    getBallX,
    getBallY,
    isBallVisible,
  };
}
