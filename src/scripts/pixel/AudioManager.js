/**
 * Manages Pixel's sound effects.
 * Audio is lazy-loaded on first unmuted play to avoid
 * browser autoplay restrictions.
 */
export function createAudioManager() {
  let muted = true;
  let barkSound = null;

  function ensureLoaded() {
    if (!barkSound) {
      barkSound = new Audio('/audio/pixel.ogg');
      barkSound.preload = 'auto';
    }
  }

  function playBark() {
    if (muted) return;
    ensureLoaded();
    barkSound.currentTime = 0;
    barkSound.volume = 0.3;
    barkSound.play().catch(() => {});
  }

  function setMuted(value) {
    muted = value;
    if (!muted) ensureLoaded();
  }

  return {
    playBark,
    setMuted,
    get muted() {
      return muted;
    },
  };
}
