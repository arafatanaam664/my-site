import { searchBuiltInTools } from "./tool-catalog";

export function searchAvailableTools(query: string, toolsEnabled: boolean) {
  return toolsEnabled ? searchBuiltInTools(query) : [];
}
