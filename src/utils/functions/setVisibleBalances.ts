import { visible } from "@store";

const setVisibleBalances = (state: boolean): void => {
  visible.set(state);
  localStorage.setItem("isVisibleBalance", `${state}`);
};

export { setVisibleBalances };
