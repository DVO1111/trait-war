// constants/client.ts
import { createEdgeClient } from "@honeycomb-protocol/edge-client";

const EDGE_API_URL = "https://edge.main.honeycombprotocol.com";

export const client = createEdgeClient(EDGE_API_URL, true);
export const PROJECT_ID = "YOUR_PROJECT_ID"; // Replace with your actual project ID
export const PROJECT_NAME = "Test Trait War Project";