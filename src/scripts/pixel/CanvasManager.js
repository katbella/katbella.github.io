/**
 * Manages the canvas element and animation loop.
 */
export function createCanvasManager({ canvasId, height = 200 }) {
  const canvas = document.getElementById(canvasId);
  const ctx = canvas.getContext('2d');

  let running = false;
  let lastTime = null;

  /**
   * Resizes canvas to fill viewport width.
   */
  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = height;
  }

  /**
   * Starts the animation loop.
   * @param {Function} tickCallback - Called each frame with (ctx, deltaTime).
   */
  function start(tickCallback) {
    resize();
    running = true;
    lastTime = null; // Reset timing on start
    requestAnimationFrame((timestamp) => loop(timestamp, tickCallback));
  }

  /**
   * Stops the animation loop.
   */
  function stop() {
    running = false;
  }

  /**
   * Main animation loop.
   */
  function loop(timestamp, tickCallback) {
    if (!running) return;

    // Calculate time since last frame
    const deltaTime = lastTime ? timestamp - lastTime : 0;
    lastTime = timestamp;

    // Disable smoothing for crisp pixel art
    ctx.imageSmoothingEnabled = false;

    // Clear canvas for fresh frame
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Run the tick callback
    tickCallback(ctx, deltaTime);

    // Schedule next frame
    requestAnimationFrame((t) => loop(t, tickCallback));
  }

  // Handle window resize
  window.addEventListener('resize', resize);

  return {
    start,
    stop,
    get width() {
      return canvas.width;
    },
    get height() {
      return canvas.height;
    },
    get canvas() {
      return canvas;
    },
    get ctx() {
      return ctx;
    },
  };
}
