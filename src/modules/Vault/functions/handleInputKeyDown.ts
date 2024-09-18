/**
 * Handles keydown events for input fields, restricting input to valid numeric values and decimal points
 *
 * @example
 * ```
 * <input
 *   onKeyDown={(evt) => handleInputKeyDown(evt, inputValue)}
 *   value={inputValue}
 * />
 * ```
 *
 * @param {React.KeyboardEvent<HTMLInputElement>} evt - Keyboard event triggered by a key press in the input field
 * @param {string} currentValue - Current value of the input field
 *
 * @returns {void} Function does not return anything, but it prevents invalid keys from being entered into the input field
 */

export const handleInputKeyDown = (
  evt: React.KeyboardEvent<HTMLInputElement>,
  currentValue: string
): void => {
  if (
    !/[\d.]/.test(evt.key) &&
    evt.key !== "Backspace" &&
    evt.key !== "ArrowLeft" &&
    evt.key !== "ArrowRight"
  ) {
    evt.preventDefault();
  }

  if (evt.key === "0" && currentValue === "0") {
    evt.preventDefault();
  }

  if (/^\d/.test(evt.key) && currentValue === "0" && evt.key !== ".") {
    evt.preventDefault();
  }

  if (evt.key === "." && currentValue && currentValue.includes(".")) {
    evt.preventDefault();
  }
};
