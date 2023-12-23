import Tokenomics from "./Tokenomics";
import Team from "./Team";
import Governance from "./Governance";
import Platform from "./Platform";

function DAO() {
  return (
    <main className="overflow-hidden">
      <Platform />
      <Tokenomics />
      <Governance />
      <Team />
    </main>
  );
}

export { DAO };
