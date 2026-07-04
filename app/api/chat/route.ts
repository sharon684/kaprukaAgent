import {
  convertToModelMessages,
  createUIMessageStreamResponse,
  streamText,
  toUIMessageStream,
  UIMessage,
} from 'ai';
import { google } from '@ai-sdk/google';
import { createMCPClient } from '@ai-sdk/mcp';
import { SYSTEM_PROMPT } from '@/lib/system-prompt';

export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const { messages }: { messages: UIMessage[] } = await req.json();

    if (!messages || messages.length === 0 || messages.length > 100) {
      return new Response('Invalid request', { status: 400 });
    }

    // Create MCP Client connecting to Kapruka's public server
    const mcpClient = await createMCPClient({
      transport: {
        type: 'http',
        url: 'https://mcp.kapruka.com/mcp',
      },
    });

    try {
      // Auto-discover tools from Kapruka's MCP server
      const tools = await mcpClient.tools();

      // Stream LLM response with tool calling
      const result = streamText({
        model: google('gemini-2.0-flash'),
        system: SYSTEM_PROMPT,
        messages: await convertToModelMessages(messages),
        tools,
        onError: (error) => {
          console.error('Stream error:', error);
        },
      });

      return createUIMessageStreamResponse({
        stream: toUIMessageStream({ stream: result.stream }),
      });
    } finally {
      // ALWAYS close the client to prevent resource leaks in serverless functions
      await mcpClient.close();
    }
  } catch (error) {
    console.error('Chat API Error:', error);
    return new Response('An error occurred processing your request.', { status: 500 });
  }
}
