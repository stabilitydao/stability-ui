import { transactionSettings, hideFeeApr, aprFilter } from "@store";

/**
 * Retrieves and applies local storage data for transaction settings, fee APR visibility, and APR filters
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
 * 3. Retrieves and applies the APR filter, converting legacy values like "week" to "weekly" and "24h" to "daily"
 *
 * @returns {void} This function does not return any values
 *
 * @sideeffects Updates the `transactionSettings`, `hideFeeApr`, and `aprFilter` stores with the retrieved data.
 */

export const getLocalStorageData = (): void => {
  const savedSettings = localStorage.getItem("transactionSettings");
  const savedHideFeeAPR = localStorage.getItem("hideFeeAPR");
  const APRsFiler = localStorage.getItem("APRsFiler");

  if (savedSettings) {
    const savedData = JSON.parse(savedSettings);
    transactionSettings.set(savedData);
  }
  if (savedHideFeeAPR) {
    const savedData = JSON.parse(savedHideFeeAPR);
    hideFeeApr.set(savedData);
  }

  let localAPRfilter = APRsFiler ? JSON.parse(APRsFiler) : "weekly";

  if (localAPRfilter === "week") {
    localAPRfilter = "weekly";
  } else if (localAPRfilter === "24h") {
    localAPRfilter = "daily";
  }

  aprFilter.set(localAPRfilter);
};
