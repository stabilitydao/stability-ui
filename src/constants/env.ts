import { deployments } from "@stabilitydao/stability";

const GRAPH_ENDPOINTS: { [key: string]: string } = {
  137: deployments[137].subgraph.replace(
    "[api-key]",
    import.meta.env.PUBLIC_GRAPH_API_KEY
  ),
  8453: deployments[8453].subgraph.replace(
    "[api-key]",
    import.meta.env.PUBLIC_GRAPH_API_KEY
  ),
};

export { GRAPH_ENDPOINTS };
