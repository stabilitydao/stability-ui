/**
 * Trims the given message to the first sentence (up to the first period).
 * If the resulting message exceeds 100 characters, it appends "..." at the end.
 *
 * @example
 * ```ts
 * const message = "An error occurred. Additional information: ...";
 * console.log(getShortMessage(message)); // "An error occurred."
 *
 * const longMessage = "A very long message that exceeds the 100-character limit there is more text here...";
 * console.log(getShortMessage(longMessage)); // "A very long message that exceeds the 100-character limit there is more te..."
 * ```
 *
 * @param {string} message - Message to trim
 * @returns {string} Short message limited to 100 characters
 */

export const getShortMessage = (message: string): string => {
  let shortMessage = message.split(".")[0];

  if (message.includes("IV")) {
    shortMessage = message.match(
      /(The contract function .*? reverted with the following reason:[\s\S]*?)\s*Contract Call:/
    );

    return shortMessage[1];
  }

  const match = message.match(/Error:\s*([\s\S]*?)\s*Contract Call:/);

  if (match) {
    const extractedMessage = match ? match[1] : message;

    shortMessage = `${shortMessage}: ${extractedMessage}`;
  }

  return shortMessage;
};
