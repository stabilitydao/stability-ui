const decodeHex = (hex: string): string => {
  if (typeof hex !== "string") {
    return "";
  }

  const hexWithoutPrefix = hex.slice(2);

  const bytes = [];
  for (let i = 0; i < hexWithoutPrefix.length; i += 2) {
    const hex = parseInt(hexWithoutPrefix.slice(i, i + 2), 16);

    if (hex) bytes.push(hex);
  }
  return new TextDecoder().decode(new Uint8Array(bytes));
};

export { decodeHex };
