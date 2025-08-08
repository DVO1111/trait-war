import createEdgeClient from "@honeycomb-protocol/edge-client";

// Use Honeycomb's test API for development
const API_URL = "https://edge.test.honeycombprotocol.com/";

// Create the Honeycomb Edge Client
export const honeycombClient = createEdgeClient(API_URL, true);

// Honeycomb constants for Trait Wars project
export const TRAIT_WARS_PROJECT_NAME = "Trait Wars";

// If you have an existing project ID, set it here:
// Replace with your actual project address from the Project Finder
export const EXISTING_PROJECT_ID = "4CJDJpvqpgxXZKjv6n8Fx6u9kPdgbALGvjYRkqk8J2E8"; // Update this with your project address