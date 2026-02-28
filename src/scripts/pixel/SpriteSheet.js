/**
 * Loads a horizontal sprite strip and exposes frame metadata.
 * Frames are arranged left-to-right in a single row.
 */
export function createSpriteSheet({
  src,
  frameWidth,
  frameHeight,
  frameCount,
  padX = 0,
}) {
  const image = new Image();
  let loaded = false;

  function load() {
    return new Promise((resolve, reject) => {
      image.onload = () => {
        loaded = true;
        resolve();
      };
      image.onerror = () => reject(new Error(`Failed to load: ${src}`));
      image.src = src;
    });
  }

  return {
    image,
    frameWidth,
    frameHeight,
    frameCount,
    padX,
    load,
    get loaded() {
      return loaded;
    },
  };
}
