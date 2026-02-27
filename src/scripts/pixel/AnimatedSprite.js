/**
 * Creates an animated sprite that cycles through frames of a sprite sheet.
 */
export function createAnimatedSprite({ spriteSheet, frameDuration = 150 }) {
  let currentFrame = 0;
  let elapsed = 0;
  let flipped = false;

  const scale = 2; // Display at 2x native size for crisp pixels

  /**
   * Advances the animation based on elapsed time.
   * @param {number} deltaTime - Milliseconds since last update.
   */
  function update(deltaTime) {
    if (!spriteSheet.loaded) return;

    elapsed += deltaTime;
    if (elapsed >= frameDuration) {
      elapsed -= frameDuration; // Preserve remainder for smoother timing
      currentFrame = (currentFrame + 1) % spriteSheet.frameCount;
    }
  }

  /**
   * Renders the current frame to the canvas.
   * @param {CanvasRenderingContext2D} ctx - Canvas context.
   * @param {number} x - X position to draw at.
   * @param {number} y - Y position to draw at.
   */
  function render(ctx, x, y) {
    if (!spriteSheet.loaded) return;

    const { image, frameWidth, frameHeight } = spriteSheet;
    const drawWidth = frameWidth * scale;
    const drawHeight = frameHeight * scale;

    ctx.save();

    if (flipped) {
      // Flip horizontally by scaling -1 on x axis
      ctx.scale(-1, 1);
      ctx.translate(-x * 2 - drawWidth, 0);
    }

    // Draw the current frame from the sprite sheet
    ctx.drawImage(
      image,
      currentFrame * frameWidth, // Source x: which frame to grab
      0, // Source y: always 0 for horizontal sheets
      frameWidth, // Source width
      frameHeight, // Source height
      x, // Destination x
      y, // Destination y
      drawWidth, // Destination width (scaled)
      drawHeight, // Destination height (scaled)
    );

    ctx.restore();
  }

  /**
   * Resets animation to first frame.
   */
  function reset() {
    currentFrame = 0;
    elapsed = 0;
  }

  /**
   * Sets horizontal flip state (for walking left vs right).
   * @param {boolean} value
   */
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
