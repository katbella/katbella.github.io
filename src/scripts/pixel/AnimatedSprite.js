import { SCALE } from './constants.js';

/**
 * Cycles through frames of a horizontal sprite strip at a fixed interval.
 * Supports horizontal flipping for directional movement.
 */
export function createAnimatedSprite({ spriteSheet, frameDuration = 150 }) {
  let currentFrame = 0;
  let elapsed = 0;
  let flipped = false;

  function update(deltaTime) {
    if (!spriteSheet.loaded) return;
    elapsed += deltaTime;
    if (elapsed >= frameDuration) {
      elapsed -= frameDuration;
      currentFrame = (currentFrame + 1) % spriteSheet.frameCount;
    }
  }

  function render(ctx, x, y) {
    if (!spriteSheet.loaded) return;
    const { image, frameWidth, frameHeight, padX } = spriteSheet;
    const w = frameWidth * SCALE;
    const h = frameHeight * SCALE;

    ctx.save();
    if (flipped) {
      ctx.scale(-1, 1);
      ctx.translate(-x * 2 - w, 0);
    }
    // padX insets the source rect to prevent edge sampling artifacts at 2x scale
    ctx.drawImage(
      image,
      currentFrame * frameWidth + padX,
      0,
      frameWidth - padX * 2,
      frameHeight,
      x,
      y,
      w,
      h,
    );
    ctx.restore();
  }

  function reset() {
    currentFrame = 0;
    elapsed = 0;
  }
  function setFlipped(value) {
    flipped = value;
  }

  return {
    update,
    render,
    reset,
    setFlipped,
    get flipped() {
      return flipped;
    },
  };
}
