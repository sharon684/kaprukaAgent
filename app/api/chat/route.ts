import {
  convertToModelMessages,
  createUIMessageStreamResponse,
  streamText,
  toUIMessageStream,
  UIMessage,
} from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import { createMCPClient } from '@ai-sdk/mcp';
import { SYSTEM_PROMPT } from '@/lib/system-prompt';

// Configure OpenRouter as the AI provider
const openrouter = createOpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY,
});

export const maxDuration = 60;

// Rate limiting: simple in-memory store (per-instance, resets on cold start)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 30; // requests per window
const RATE_WINDOW_MS = 60_000; // 1 minute

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_WINDOW_MS });
    return false;
  }

  entry.count++;
  return entry.count > RATE_LIMIT;
}

// Input sanitization
function sanitizeMessages(messages: UIMessage[]): UIMessage[] {
  return messages.map((msg) => ({
    ...msg,
    parts: msg.parts.map((part) => {
      if (part.type === 'text') {
        // Strip potential injection patterns from text
        const sanitized = part.text
          .slice(0, 4000) // Cap individual message length
          .replace(/<script[^>]*>.*?<\/script>/gi, '') // Remove script tags
          .replace(/javascript:/gi, ''); // Remove javascript: URLs
        return { ...part, text: sanitized };
      }
      return part;
    }),
  }));
}

export async function POST(req: Request) {
  try {
    // Rate limiting
    const forwarded = req.headers.get('x-forwarded-for');
    const ip = forwarded?.split(',')[0]?.trim() || 'unknown';
    if (isRateLimited(ip)) {
      return new Response('Too many requests. Please wait a moment.', { status: 429 });
    }

    const body = await req.json();
    const messages: UIMessage[] = body.messages;

    // Validate request structure
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response('Invalid request: messages required', { status: 400 });
    }
    if (messages.length > 100) {
      return new Response('Conversation too long. Please start a new chat.', { status: 400 });
    }

    // Sanitize inputs
    const cleanMessages = sanitizeMessages(messages);

    // Create MCP Client connecting to Kapruka's public server
    let mcpClient;
    try {
      mcpClient = await createMCPClient({
        transport: {
          type: 'http',
          url: 'https://mcp.kapruka.com/mcp',
        },
      });
    } catch (mcpError) {
      console.error('MCP connection failed:', mcpError);
      return new Response(
        'Unable to connect to Kapruka services. Please try again in a moment.',
        { status: 503 }
      );
    }

    try {
      // Auto-discover tools from Kapruka's MCP server
      const tools = await mcpClient.tools();

      // Stream LLM response with tool calling
      const result = streamText({
        model: openrouter('google/gemini-2.0-flash-001'),
        system: SYSTEM_PROMPT,
        messages: await convertToModelMessages(cleanMessages),
        tools,
        onError: (error) => {
          console.error('Stream error:', error);
        },
      });

      return createUIMessageStreamResponse({
        stream: toUIMessageStream({ stream: result.stream }),
      });
    } finally {
      // ALWAYS close the client to prevent resource leaks
      await mcpClient.close();
    }
  } catch (error) {
    console.error('Chat API Error:', error);

    // Differentiate error types for better UX
    if (error instanceof SyntaxError) {
      return new Response('Invalid JSON in request.', { status: 400 });
    }

    return new Response(
      'An error occurred processing your request. Please try again.',
      { status: 500 }
    );
  }
}
