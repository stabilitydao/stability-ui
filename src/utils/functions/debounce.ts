export const debounce = (fn: any, ms: number) => {
  let timeout: any;
  return function () {
    const fnCall = () => {
      fn.apply(this as any, arguments);
    };
    clearTimeout(timeout);
    timeout = setTimeout(fnCall, ms);
  };
};
