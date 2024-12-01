import { transactionSettings, aprFilter, visible } from "@store";

/**
 * Retrieves and applies local storage data for transaction settings, fee APR visibility, and APR filters etc.
 *
 * @example
 * ```
 * // Example usage:
 * getLocalStorageData();
 * ```
 *
 * The function performs the following tasks:
 * 1. Retrieves and applies transaction settings saved in `localStorage`
 * 2. Retrieves and applies the hide fee APR setting from `localStorage`
 * 3. Retrieves and applies the APR filter, converting legacy values like "week" to "weekly" and "24h" to "daily" etc.
 *
 * @returns {void} This function does not return any values
 *
 * @sideeffects Updates the `transactionSettings` and `aprFilter` and other stores with the retrieved data.
 */

export const getLocalStorageData = (): void => {
  const savedSettings = localStorage.getItem("transactionSettings");
  const APRsFiler = localStorage.getItem("APRsFiler");
  const isVisibleBalance = localStorage.getItem("isVisibleBalance");

  const isBalanceVisible =
    isVisibleBalance === "true"
      ? true
      : isVisibleBalance === "false"
        ? false
        : true;

  if (savedSettings) {
    const savedData = JSON.parse(savedSettings);
    transactionSettings.set(savedData);
  }

  let localAPRfilter = APRsFiler ? JSON.parse(APRsFiler) : "weekly";

  if (localAPRfilter === "week") {
    localAPRfilter = "weekly";
  } else if (localAPRfilter === "24h") {
    localAPRfilter = "daily";
  }

  visible.set(isBalanceVisible);
  aprFilter.set(localAPRfilter);
};
