/**
 * virtualKeys.ts
 * A shared singleton that mobile touch controls write to,
 * and the Phaser Player entity reads from as a fallback when keyboard is unavailable.
 */
export const virtualKeys = {
  up: false,
  down: false,
  left: false,
  right: false,
  attack: false,
  dodge: false,
};
