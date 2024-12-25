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
  111188:
    "https://api.goldsky.com/api/public/project_cm2v16o5ct0ql01vr3m5o0vt2/subgraphs/stability-subgraph/0.0.13/gn",
  146: deployments[8453].subgraph.replace(
    "[api-key]",
    import.meta.env.PUBLIC_GRAPH_API_KEY
  ),
};

export { GRAPH_ENDPOINTS };
