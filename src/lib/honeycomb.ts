import createEdgeClient from "@honeycomb-protocol/edge-client";

// Use Honeycomb's test API for development
const API_URL = "https://edge.test.honeycombprotocol.com/";

// Create the Honeycomb Edge Client
export const honeycombClient = createEdgeClient(API_URL, true);

// Honeycomb constants for Trait Wars project
export const TRAIT_WARS_PROJECT_NAME = "Trait Wars";

// If you have an existing project ID, set it here:
// export const EXISTING_PROJECT_ID = "your-project-address-here";
export const EXISTING_PROJECT_ID = null; // Set this to your project address if you have one