import React, { useEffect, useState } from "react";
import Tokenomics from "./Tokenomics";
import Team from "./Team";
import Governance from "./Governance";
import Platform from "./Platform";
import axios from "axios";
import { GRAPH_QUERY, GRAPH_ENDPOINT } from "@constants";

function DAO() {
  const [graphData, setGraphData] = useState<any>();

  const fetchGraph = async () => {
    try {
      const response = await axios.post(
        GRAPH_ENDPOINT,
        { query: GRAPH_QUERY },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      setGraphData(response.data.data.vaultEntities);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  useEffect(() => {
    fetchGraph();
  }, []);

  return (
    <main className="p-0 m-auto">
      <Platform graphData={graphData} />
      <Tokenomics />
      <Governance />
      <Team />
    </main>
  );
}

export { DAO };
