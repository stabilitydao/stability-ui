export const getShortErrorMessage = (message: string): string => {
  let shortErrorMessage = "Error.";

  if (message?.includes("User rejected")) {
    shortErrorMessage = "You cancelled the transaction.";
  } else if (message?.includes("arithmetic")) {
    shortErrorMessage = "Arithmetic underflow or overflow.";
  }

  return shortErrorMessage;
};
