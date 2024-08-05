import { transactionSettings, hideFeeApr, aprFilter } from "@store";

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
