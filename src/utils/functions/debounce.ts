export const debounce = (fn: any, ms: number) => {
  let timeout: ReturnType<typeof setTimeout>;

  return function () {
    const fnCall = () => {
      fn.apply(this, arguments);
    };
    clearTimeout(timeout);
    timeout = setTimeout(fnCall, ms);
  };
};
