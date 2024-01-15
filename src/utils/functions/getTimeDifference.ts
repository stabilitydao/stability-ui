export const getTimeDifference = (unix: number | string | bigint) => {
  unix = Number(unix);
  const currentTime = new Date().getTime() / 1000;
  const targetTime = unix;

  const differenceInSeconds = currentTime - targetTime;

  const days = Math.floor(differenceInSeconds / (60 * 60 * 24));
  const hours = Math.floor((differenceInSeconds % (60 * 60 * 24)) / (60 * 60));
  //const minutes = Math.floor((differenceInSeconds % (60 * 60)) / 60);
  //const seconds = differenceInSeconds % 60;

  return { days: days, hours: hours };
};
