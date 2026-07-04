import { streamText } from 'ai';
import { google } from '@ai-sdk/google';
import { createMCPClient } from '@ai-sdk/mcp';
import { SYSTEM_PROMPT } from '@/lib/system-prompt';
import { z } from 'zod';

const RequestSchema = z.object({
  messages: z.array(z.object({
    role: z.enum(['user', 'assistant', 'system', 'data']),
    content: z.string(),
  })).max(100, 'Conversation too long'),
});

export const maxDuration = 60; // Max allowed for Vercel Hobby

export async function POST(req: Request) {
  try {
    const rawBody = await req.json();
    const parsed = RequestSchema.safeParse(rawBody);

    if (!parsed.success) {
      return new Response('Invalid request', { status: 400 });
    }

    const messages = parsed.data.messages as any;

    // Create MCP Client connecting to Kapruka's public server
    const mcpClient = await createMCPClient({
      transport: {
        type: 'http',
        url: 'https://mcp.kapruka.com/mcp'
      }
    });

    try {
      // Auto-discover tools from Kapruka's MCP server
      const tools = await mcpClient.tools();

      // Start the AI stream with multi-step capability
      const result = await streamText({
        model: google('gemini-2.0-flash'),
        system: SYSTEM_PROMPT,
        messages,
        tools,
        onError: (error) => {
          console.error("Stream error:", error);
        }
      });

      return result.toTextStreamResponse();
    } finally {
      // ALWAYS close the client to prevent resource leaks in serverless functions
      await mcpClient.close();
    }
  } catch (error) {
    console.error('Chat API Error:', error);
    return new Response('An error occurred processing your request.', { status: 500 });
  }
}
