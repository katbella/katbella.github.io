import { SPRITES, FRAME_DURATIONS, SCALE } from './constants.js';
import { createSpriteSheet } from './SpriteSheet.js';
import { createAnimatedSprite } from './AnimatedSprite.js';
import { createCanvasManager } from './CanvasManager.js';
import { createBall } from './BallPhysics.js';
import { createPixelState } from './PixelState.js';
import { createAudioManager } from './AudioManager.js';

/**
 * Main initialization script for Pixel's interactive animation.
 * So much code to make a dog walk around and play with a ball!
 * I thought about using something like Phaser, but it felt like overkill for a personal hompage.
 */

async function init() {
  // Load all sprite sheets in parallel
  const sheets = Object.fromEntries(
    Object.entries(SPRITES).map(([name, cfg]) => [
      name,
      createSpriteSheet(cfg),
    ]),
  );
  await Promise.all(Object.values(sheets).map((s) => s.load()));

  // Create animated sprites (ball gets its own since it's static)
  const sprites = {};
  for (const [name, sheet] of Object.entries(sheets)) {
    if (name === 'ball') continue;
    sprites[name] = createAnimatedSprite({
      spriteSheet: sheet,
      frameDuration: FRAME_DURATIONS[name],
    });
  }
  const ballSprite = createAnimatedSprite({
    spriteSheet: sheets.ball,
    frameDuration: FRAME_DURATIONS.ball,
  });

  // Canvas
  const manager = createCanvasManager({
    canvasId: 'pixel-canvas',
    height: 200,
  });
  const pixelY = manager.height - sheets.idle.frameHeight * SCALE;
  const groundY = manager.height - sheets.ball.frameHeight * SCALE - 10;

  // Ball (physics only - rendering handled in loop)
  const ball = createBall({
    ballWidth: sheets.ball.frameWidth,
    groundY,
    getCanvasWidth: () => manager.width,
  });

  // Pixel (state machine)
  const pixel = createPixelState({
    sprites,
    ball,
    getCanvasWidth: () => manager.width,
    spriteWidth: sheets.walk.frameWidth,
    spriteHeight: sheets.walk.frameHeight,
  });

  // --- Audio (starts muted, toggled by UI button) ---

  const audio = createAudioManager();
  const audioBtn = document.getElementById('audio-toggle');
  if (audioBtn) {
    audioBtn.addEventListener('click', () => {
      audio.setMuted(!audio.muted);
      audioBtn.setAttribute('aria-pressed', !audio.muted);
    });
  }

  // --- Input: click to bark, drag ball to throw ---

  let dragging = false;
  let dragStartX = 0;

  function canvasCoords(e) {
    const r = manager.canvas.getBoundingClientRect();
    return {
      x: e.clientX - r.left,
      y: e.clientY - r.top,
      inCanvas: e.clientY >= r.top && e.clientY <= r.bottom,
    };
  }

  document.addEventListener('mousedown', (e) => {
    const { x, y, inCanvas } = canvasCoords(e);
    if (!inCanvas) return;

    if (ball.containsPoint(x, y)) {
      dragging = true;
      dragStartX = x;
      e.preventDefault();
    } else if (pixel.containsPoint(x, y, pixelY)) {
      pixel.bark();
      audio.playBark();
      if (audio.muted && audioBtn) {
        audioBtn.classList.add('hint');
        audioBtn.addEventListener(
          'animationend',
          () => audioBtn.classList.remove('hint'),
          { once: true },
        );
      }
    }
  });

  document.addEventListener('mouseup', (e) => {
    if (!dragging) return;
    const { x } = canvasCoords(e);
    if (ball.throwable) {
      ball.launch(x, (x - dragStartX) * 0.08, -0.4);
      pixel.onBallThrown(x);
    }
    dragging = false;
  });

  // --- Render loop ---

  manager.start((ctx, dt) => {
    ball.update(dt);
    pixel.update(dt);

    if (ball.visible) ballSprite.render(ctx, ball.x, ball.y);

    const active = pixel.getActiveSprite();
    if (active) {
      active.setFlipped(pixel.getDirection() === -1);
      active.update(dt);
      active.render(ctx, pixel.getX(), pixelY);
    }
  });
}

init();
