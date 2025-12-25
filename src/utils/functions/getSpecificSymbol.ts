export const getSpecificSymbol = (specific: string): string => {
  const parts = specific ? specific.trim().split(/\s+/) : "";

  for (const part of parts) {
    if (!/^\d+(\.\d+)?$/.test(part)) {
      if (/^x\d+(\.\d+)?$/.test(part)) continue;

      return part;
    }
  }

  return "";
};
