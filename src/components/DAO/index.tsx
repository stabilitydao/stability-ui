import { Platform } from "./Platform";
import { Tokenomics } from "./Tokenomics";
import { Governance } from "./Governance";
import { Team } from "./Team";

const DAO = () => {
  return (
    <main className="p-0">
      <Platform />
      <Tokenomics />
      <Governance />
      <Team />
    </main>
  );
};

export { DAO };
