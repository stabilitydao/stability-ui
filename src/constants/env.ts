import { deployments } from "@stabilitydao/stability";

const GRAPH_ENDPOINTS: { [key: string]: string } = {
  // 137: deployments[137].subgraph.replace(
  //   "[api-key]",
  //   import.meta.env.PUBLIC_GRAPH_API_KEY
  // ),
  // 8453: deployments[8453].subgraph.replace(
  //   "[api-key]",
  //   import.meta.env.PUBLIC_GRAPH_API_KEY
  // ),
  146: deployments[146].subgraph.replace(
    "[api-key]",
    import.meta.env.PUBLIC_GRAPH_API_KEY
  ),
  9745: deployments[9745].subgraph,
  43114: deployments[43114].subgraph,
};

export { GRAPH_ENDPOINTS };
