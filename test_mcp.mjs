import { createMCPClient } from "@ai-sdk/mcp";

async function test() {
  const mcpClient = await createMCPClient({
    transport: {
      type: 'http',
      url: 'https://mcp.kapruka.com/mcp',
    },
  });
  
  const tools = await mcpClient.tools();
  console.log("Tools available:", Object.keys(tools));

  const searchTool = tools.kapruka_search_products;
  if (searchTool) {
    try {
      const result = await searchTool.execute({ params: { q: "anniversary flowers" } }, {});
      console.log("Result:", JSON.stringify(result).substring(0, 500));
      console.log("Result:", JSON.stringify(result, null, 2));
    } catch (e) {
      console.error("Tool execution failed:", e);
    }
  }
  
  await mcpClient.close();
}

test().catch(console.error);
