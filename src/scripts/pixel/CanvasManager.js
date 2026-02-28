/**
 * Owns the canvas element and runs the request animation frame loop.
 * Disables image smoothing each frame for crisp pixel art.
 */
export function createCanvasManager({ canvasId, height = 200 }) {
  const canvas = document.getElementById(canvasId);
  const ctx = canvas.getContext('2d');
  let running = false;
  let lastTime = null;

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = height;
  }

  function start(tickCallback) {
    resize();
    running = true;
    lastTime = null;
    requestAnimationFrame((t) => loop(t, tickCallback));
  }

  function stop() {
    running = false;
  }

  function loop(timestamp, tickCallback) {
    if (!running) return;
    const deltaTime = lastTime ? Math.min(timestamp - lastTime, 50) : 0;
    lastTime = timestamp;

    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    tickCallback(ctx, deltaTime);
    requestAnimationFrame((t) => loop(t, tickCallback));
  }

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
