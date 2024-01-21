const decodeHex = (hex: string) => {
  const hexWithoutPrefix = hex.slice(2);

  const bytes = [];
  for (let i = 0; i < hexWithoutPrefix.length; i += 2) {
    let a = parseInt(hexWithoutPrefix.substr(i, 2), 16);
    if (a) bytes.push(a);
  }

  return new TextDecoder().decode(new Uint8Array(bytes));
};

export { decodeHex };
