/**
 * Plays an audio file from the "/sounds" directory with a specified volume
 *
 * @example
 *
 * ```ts
 * // Play "pp.mp3" at 50% volume
 * playAudio("pp", 0.5);
 *
 * // Play "ap.mp3" at full volume (default)
 * playAudio("ap);
 * ```
 *
 * @param {string} soundName - Name of the sound file (without extension)
 * @param {number} [volume=1] - Volume level (range: 0.0 to 1, default is 1)
 *
 * @returns {void}
 */

export const playAudio = (soundName: string, volume: number = 1): void => {
  const audio = new Audio(`/sounds/${soundName}.mp3`);
  audio.volume = volume;
  audio.play();
};
