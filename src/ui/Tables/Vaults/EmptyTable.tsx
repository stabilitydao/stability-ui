import { useWeb3Modal } from "@web3modal/wagmi/react";

interface IProps {
  isUserVaults: boolean;
}

const EmptyTable: React.FC<IProps> = ({ isUserVaults }) => {
  const { open } = useWeb3Modal();

  return (
    <div className="text-start h-[60px] font-medium">
      {isUserVaults ? (
        <div>
          <p className="text-[18px]">You haven't connected your wallet.</p>
          <p>Connect to view your vaults.</p>
          <button
            className="bg-[#30127f] text-[#fcf3f6] py-0.5 px-4 rounded-md min-w-[120px] mt-2"
            onClick={() => open()}
          >
            Connect Wallet
          </button>
        </div>
      ) : (
        <div>
          <p className="text-[18px]">No results found.</p>
          <p>Try clearing your filters or changing your search term.</p>
        </div>
      )}
    </div>
  );
};

export { EmptyTable };
