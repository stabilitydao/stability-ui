export const getShortErrorMessage = (message: string): string => {
  let shortErrorMessage = "Error.";

  if (message?.includes("User rejected")) {
    shortErrorMessage = "You cancelled the transaction.";
  }

  return shortErrorMessage;
};
