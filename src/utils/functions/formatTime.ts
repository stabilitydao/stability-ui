type TTimePart = {
  label: string;
  value: number;
};

const getLabel = (value: number, one: string, many: string) =>
  Number(value) === 1 ? one : many;

export const formatTime = (seconds: number): TTimePart[] => {
  const days = Math.floor(seconds / (3600 * 24));
  const hours = Math.floor((seconds % (3600 * 24)) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  return [
    { label: getLabel(days, "DAY", "DAYS"), value: days },
    { label: getLabel(hours, "HOUR", "HOURS"), value: hours },
    { label: getLabel(minutes, "MIN", "MINS"), value: minutes },
    { label: getLabel(secs, "SEC", "SECS"), value: secs },
  ];
};
