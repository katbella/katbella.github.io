/**
 * Creates a sprite sheet handler for loading and accessing animation frames.
 * Frames are expected to be arranged horizontally in a single row.
 */
export function createSpriteSheet({
  src,
  frameWidth,
  frameHeight,
  frameCount,
}) {
  const image = new Image();
  let loaded = false;

  /**
   * Loads the sprite sheet image.
   * @returns {Promise} Resolves when image is loaded, rejects on error.
   */
  function load() {
    return new Promise((resolve, reject) => {
      image.onload = () => {
        loaded = true;
        resolve();
      };
      image.onerror = () =>
        reject(new Error(`Failed to load sprite sheet: ${src}`));
      image.src = src;
    });
  }

  return {
    image,
    frameWidth,
    frameHeight,
    frameCount,
    load,
    get loaded() {
      return loaded;
    },
  };
}
