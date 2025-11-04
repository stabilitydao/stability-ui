import { useState, useEffect } from "react";

import { useSwitchChain } from "wagmi";

import { useStore } from "@nanostores/react";

import { Loader } from "@ui";

import { cn } from "@utils";

import { currentChainID } from "@store";

interface IProps {
  network?: string;
}

const SwitchNetworkButton: React.FC<IProps> = ({ network = "146" }) => {
  const $currentChainID = useStore(currentChainID);

  const { switchChain } = useSwitchChain();

  const [isPending, setIsPending] = useState(false);

  const changeNetwork = async () => {
    try {
      setIsPending(true);
      switchChain({ chainId: Number(network) });
    } catch (err) {
      console.error("Failed to switch chain:", err);
      setIsPending(false);
    }
  };

  useEffect(() => {
    if ($currentChainID === network && isPending) {
      setIsPending(false);
    }
  }, [$currentChainID, network]);

  return (
    <button
      className={cn(
        "bg-[#5E6AD2] rounded-lg w-full text-[16px] leading-5 font-bold",
        isPending && "bg-[#35363B] text-[#6A6B6F]"
      )}
      onClick={changeNetwork}
    >
      <div className="flex items-center justify-center gap-2 px-6 py-4">
        Switch Network
        {isPending && <Loader color={"#a6a0b2"} />}
      </div>
    </button>
  );
};

export { SwitchNetworkButton };
