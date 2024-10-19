import type { TTableProtocol } from "@types";

type TProps = {
  protocols: TTableProtocol[];
};

const ProtocolsList: React.FC<TProps> = ({ protocols }) => {
  let currentProtocols = protocols;

  const total = currentProtocols.length;

  let more;
  if (total > 6) {
    currentProtocols = protocols.slice(0, 5);
    more = `+${total - 5}`;
  }

  return (
    <div className="flex flex-wrap items-center">
      {currentProtocols.map((protocol) => (
        <a
          key={protocol.name}
          className="inline-flex p-1 hover:bg-gray-700 rounded-xl"
          title={protocol.name}
          href={protocol.website}
          target="_blank"
        >
          <img
            className="w-[20px] h-[20px] rounded-full"
            src={`https://raw.githubusercontent.com/stabilitydao/.github/main/assets/${protocol.img}`}
            alt={protocol.name}
          />
        </a>
      ))}
      {!!more && (
        <p className="text-accent-400 text-[12px] flex items-center justify-center font-semibold w-6 h-6 bg-accent-900 rounded-full">
          {more}
        </p>
      )}
    </div>
  );
};

export { ProtocolsList };
