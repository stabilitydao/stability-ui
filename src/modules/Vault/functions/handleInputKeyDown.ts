const handleInputKeyDown = (
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

export { handleInputKeyDown };
