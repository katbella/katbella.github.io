/**
 * All tunable values for Pixel's canvas widget.
 *
 * Sprite sheets are horizontal strips: frameWidth = image width / frameCount.
 * Frame durations control animation speed (lower = faster).
 */

export const SPRITES = {
  idle: {
    src: '/sprites/idle-sheet.png',
    frameWidth: 88,
    frameHeight: 54,
    frameCount: 4,
    padX: 1,
  },
  idleSniff: {
    src: '/sprites/idle-sniff-sheet.png',
    frameWidth: 88,
    frameHeight: 53,
    frameCount: 8,
    padX: 1,
  },
  pickUpBall: {
    src: '/sprites/pick-up-ball-sheet.png',
    frameWidth: 98,
    frameHeight: 53,
    frameCount: 5,
    padX: 1,
  },
  run: {
    src: '/sprites/run-sheet.png',
    frameWidth: 88,
    frameHeight: 54,
    frameCount: 5,
    padX: 1,
  },
  sitBark: {
    src: '/sprites/sit-bark-sheet.png',
    frameWidth: 98,
    frameHeight: 54,
    frameCount: 4,
  },
  sit: {
    src: '/sprites/sit-sheet.png',
    frameWidth: 89,
    frameHeight: 54,
    frameCount: 4,
    padX: 1,
  },
  walkBall: {
    src: '/sprites/walk-ball-sheet.png',
    frameWidth: 88,
    frameHeight: 53,
    frameCount: 5,
    padX: 1,
  },
  walk: {
    src: '/sprites/walk-sheet.png',
    frameWidth: 88,
    frameHeight: 53,
    frameCount: 5,
    padX: 1,
  },
  ball: {
    src: '/sprites/ball.png',
    frameWidth: 7,
    frameHeight: 7,
    frameCount: 1,
  },
};

export const FRAME_DURATIONS = {
  idle: 150,
  idleSniff: 150,
  pickUpBall: 150,
  run: 100,
  sitBark: 150,
  sit: 150,
  walkBall: 150,
  walk: 150,
  ball: 1000,
};

export const SCALE = 2;

export const TIMING = {
  ENTRANCE_DELAY: 5000,
  IDLE_DURATION: 2000,
  SIT_DURATION: 3000,
  BARK_DURATION: 600,
  GONE_DURATION: 10000,
  PICKUP_DURATION: 500,
  DROP_DURATION: 500,
  /** Minimum walk time before Pixel will drop the ball */
  RETURN_MIN_WALK: 500,
};

export const MOVEMENT = {
  WALK_SPEED: 0.15, // px/ms
  RUN_SPEED: 0.3,
};

export const BALL_PHYSICS = {
  GRAVITY: 0.001, // px/ms²
  BOUNCE: 0.6, // energy retained per bounce (0-1)
  FRICTION: 0.98, // velocity multiplier per frame
  MIN_VELOCITY: 0.01, // threshold to consider "stopped"
};

/** Personality knobs */
export const BEHAVIOR = {
  STUBBORN_CHANCE: 0.2, // chance she keeps the ball after fetching
  JUDGE_CHANCE: 0.15, // chance she does the judgmental sniff-stare
};
