import { createSpriteSheet } from './SpriteSheet.js';
import { createAnimatedSprite } from './AnimatedSprite.js';
import { createCanvasManager } from './CanvasManager.js';
import { createPixelState } from './PixelState.js';

/**
 * Sprite sheet configurations.
 * frameWidth = total image width / frame count
 */
const SHEET_CONFIG = {
  idle: {
    src: '/sprites/idle-sheet.png',
    frameWidth: 88,
    frameHeight: 54,
    frameCount: 4,
  },
  idleSniff: {
    src: '/sprites/idle-sniff-sheet.png',
    frameWidth: 88,
    frameHeight: 53,
    frameCount: 8,
  },
  pickUpBall: {
    src: '/sprites/pick-up-ball-sheet.png',
    frameWidth: 98,
    frameHeight: 53,
    frameCount: 5,
  },
  run: {
    src: '/sprites/run-sheet.png',
    frameWidth: 88,
    frameHeight: 54,
    frameCount: 5,
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
  },
  walkBall: {
    src: '/sprites/walk-ball-sheet.png',
    frameWidth: 88,
    frameHeight: 53,
    frameCount: 5,
  },
  walk: {
    src: '/sprites/walk-sheet.png',
    frameWidth: 88,
    frameHeight: 53,
    frameCount: 5,
  },
  ball: {
    src: '/sprites/ball.png',
    frameWidth: 7,
    frameHeight: 7,
    frameCount: 1,
  },
};

/**
 * Animation durations (ms per frame).
 * Lower = faster animation.
 */
const FRAME_DURATIONS = {
  idle: 150,
  idleSniff: 150,
  pickUpBall: 150,
  run: 100,
  sitBark: 150,
  sit: 150,
  walkBall: 150,
  walk: 150,
};

async function init() {
  // ============================================
  // Load sprite sheets
  // ============================================
  const sheets = {};
  for (const [name, config] of Object.entries(SHEET_CONFIG)) {
    sheets[name] = createSpriteSheet(config);
  }
  await Promise.all(Object.values(sheets).map((s) => s.load()));

  // ============================================
  // Create animated sprites
  // ============================================
  const sprites = {};
  for (const [name, sheet] of Object.entries(sheets)) {
    if (name === 'ball') continue;
    sprites[name] = createAnimatedSprite({
      spriteSheet: sheet,
      frameDuration: FRAME_DURATIONS[name] || 150,
    });
  }

  const ballSprite = createAnimatedSprite({
    spriteSheet: sheets.ball,
    frameDuration: 1000,
  });

  // ============================================
  // Set up canvas
  // ============================================
  const manager = createCanvasManager({
    canvasId: 'pixel-canvas',
    height: 200,
  });

  const pixelY = manager.height - sheets.idle.frameHeight * 2;
  const ballRestY = manager.height - sheets.ball.frameHeight * 2 - 10;

  // ============================================
  // Create Pixel
  // ============================================
  const pixel = createPixelState({
    sprites,
    getCanvasWidth: () => manager.width,
    spriteWidth: sheets.walk.frameWidth,
    spriteHeight: sheets.walk.frameHeight,
    ballWidth: sheets.ball.frameWidth,
    groundY: ballRestY,
  });

  // ============================================
  // Input helpers
  // ============================================
  function getCanvasCoords(e) {
    const rect = manager.canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      inCanvas: e.clientY >= rect.top && e.clientY <= rect.bottom,
    };
  }

  // ============================================
  // Drag-to-throw ball
  // ============================================
  let isDragging = false;
  let dragStartX = 0;

  document.addEventListener('mousedown', (e) => {
    const { x, y, inCanvas } = getCanvasCoords(e);
    if (!inCanvas) return;

    // Grab ball
    if (pixel.ballContainsPoint(x, y)) {
      isDragging = true;
      dragStartX = x;
      e.preventDefault();
      return;
    }

    // Bork
    if (pixel.containsPoint(x, y, pixelY)) {
      pixel.bark();
    }
  });

  document.addEventListener('mouseup', (e) => {
    if (!isDragging) return;

    const { x } = getCanvasCoords(e);

    // Throw velocity based on drag distance
    const velocityX = (x - dragStartX) * 0.08;
    const velocityY = -0.4;

    pixel.throwBall(x, velocityX, velocityY);
    isDragging = false;
  });

  // ============================================
  // Render loop
  // ============================================
  manager.start((ctx, deltaTime) => {
    pixel.update(deltaTime);

    // Ball
    if (pixel.isBallVisible()) {
      ballSprite.render(ctx, pixel.getBallX(), pixel.getBallY());
    }

    // Pixel
    const active = pixel.getActiveSprite();
    if (active) {
      active.setFlipped(pixel.getDirection() === -1);
      active.update(deltaTime);
      active.render(ctx, pixel.getX(), pixelY);
    }
  });
}

init();
