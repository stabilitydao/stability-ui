/**
 * Creates a debounced version of the provided function that will delay its execution
 * until after a specified amount of time has passed since the last time it was invoked
 *
 * @example
 * ```
 * // Define a function to be debounced
 * const logMessage = (message: string) => {
 *   console.log(message);
 * };
 *
 * // Create a debounced version of the logMessage function with a 500ms delay
 * const debouncedLogMessage = debounce(logMessage, 500);
 *
 * // Call the debounced function multiple times
 * debouncedLogMessage("First call");
 * debouncedLogMessage("Second call");
 *
 * // Only the last call ("Second call") will be logged after 500ms
 * ```
 *
 * @param {Function} fn - Function to debounce. This function will be executed after the debounce delay
 * @param {number} ms - Number of milliseconds to wait before invoking the debounced function
 *
 * @returns {Function} Debounced version of the provided function
 *
 * @remarks
 * - Debounced function will delay its execution until after `ms` milliseconds have passed
 *   since the last time it was called
 * - The debounced function is called again before the delay period ends, the previous
 *   timeout is cleared and the delay is restarted
 * - Context (`this`) and arguments of the original function are preserved when the function is executed
 */

export const debounce = (fn: any, ms: number) => {
  let timeout: ReturnType<typeof setTimeout>;

  return function () {
    const fnCall = () => {
      fn.apply(this, arguments);
    };
    clearTimeout(timeout);
    timeout = setTimeout(fnCall, ms);
  };
};
