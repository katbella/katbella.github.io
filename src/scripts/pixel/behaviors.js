import { BEHAVIOR } from './constants.js';

/**
 * Decides what Pixel does next after finishing an idle/sit state.
 *
 * Behavior weights when ball is NOT held:
 *   10% run off screen, 15% walk off screen, 75% walk to random spot
 *
 * When holding the ball she only walks around (*shouldn't* leave with it but I swear she tries sometimes).
 *
 */
export function pickNextBehavior(holdingBall) {
  if (holdingBall) return { type: 'walk' };

  const roll = Math.random();
  if (roll < 0.1) return { type: 'run_offscreen' };
  if (roll < 0.25) return { type: 'leave' };
  return { type: 'walk' };
}

/** Should Pixel do the judgmental sniff-stare? */
export function shouldJudge() {
  return Math.random() < BEHAVIOR.JUDGE_CHANCE;
}

/** Should Pixel stubbornly keep the ball? */
export function shouldKeepBall() {
  return Math.random() < BEHAVIOR.STUBBORN_CHANCE;
}

/** Pick a random direction: 1 (right) or -1 (left). */
export function randomDirection() {
  return Math.random() < 0.5 ? 1 : -1;
}

/** Random X within the middle 80% of the canvas. */
export function pickRandomTarget(maxX) {
  const margin = maxX * 0.1;
  return margin + Math.random() * (maxX - margin * 2);
}
