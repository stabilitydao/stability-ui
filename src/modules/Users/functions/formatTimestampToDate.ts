const formatTimestampToDate = (timestamp: number): string => {
  const date = new Date(timestamp * 1000);
  const day = date.getDate();
  let dayStr
  if (day === 1 || day === 21 || day === 31) {
    dayStr = `${day}st`
  } else if (day === 2 || day === 22) {
    dayStr = `${day}nd`
  } else if (day === 3 || day === 23) {
    dayStr = `${day}rd`
  } else {
    dayStr = `${day}th`
  }

  const month = date.getMonth() + 1;
  let monthStr
  if (month === 1) {
    monthStr = 'Jan'
  } else if (month === 2) {
    monthStr = 'Feb'
  } else if (month === 3) {
    monthStr = 'Mar'
  } else if (month === 4) {
    monthStr = 'Apr'
  } else if (month === 5) {
    monthStr = 'May'
  } else if (month === 6) {
    monthStr = 'Jun'
  } else if (month === 7) {
    monthStr = 'Jul'
  } else if (month === 8) {
    monthStr = 'Aug'
  } else if (month === 9) {
    monthStr = 'Sept'
  } else if (month === 10) {
    monthStr = 'Oct'
  } else if (month === 11) {
    monthStr = 'Nov'
  } else if (month === 12) {
    monthStr = 'Dec'
  }
  return `${dayStr} ${monthStr}`;
};

export { formatTimestampToDate };
