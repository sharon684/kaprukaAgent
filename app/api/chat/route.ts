import {
  convertToModelMessages,
  createUIMessageStreamResponse,
  streamText,
  toUIMessageStream,
  UIMessage,
} from 'ai';
import { createOpenAICompatible } from '@ai-sdk/openai-compatible';
import { createMCPClient } from '@ai-sdk/mcp';
import { SYSTEM_PROMPT } from '@/lib/system-prompt';

// Configure NVIDIA API as the AI provider using the compatible SDK
const nvidia = createOpenAICompatible({
  name: 'nim',
  baseURL: 'https://integrate.api.nvidia.com/v1',
  headers: {
    Authorization: `Bearer ${process.env.NVIDIA_API_KEY}`,
  },
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
function sanitizeMessages(messages: any[]): any[] {
  return messages.map((msg) => {
    // Handle parts-based messages (Vercel AI SDK v7 rich messages)
    if (msg.parts && Array.isArray(msg.parts)) {
      return {
        ...msg,
        parts: msg.parts.map((part: any) => {
          if (part.type === 'text') {
            const sanitized = part.text
              .slice(0, 4000)
              .replace(/<script[^>]*>.*?<\/script>/gi, '')
              .replace(/javascript:/gi, '');
            return { ...part, text: sanitized };
          }
          return part;
        }),
      };
    }
    
    // Handle legacy/standard string content messages
    if (typeof msg.content === 'string') {
      const sanitized = msg.content
        .slice(0, 4000)
        .replace(/<script[^>]*>.*?<\/script>/gi, '')
        .replace(/javascript:/gi, '');
      return { ...msg, content: sanitized };
    }

    return msg;
  });
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
      const rawTools = await mcpClient.tools();
      
      // Intercept tool executions to fix LLM schema hallucination where it flattens arguments
      const tools = Object.fromEntries(
        Object.entries(rawTools).map(([name, tool]) => [
          name,
          {
            ...tool,
            execute: async (args: any, options: any) => {
              // Intercept and sanitize arguments to prevent Pydantic extra_forbidden errors
              let finalArgs = args;
              
              if (!args.params) {
                const fixedArgs: Record<string, any> = {};
                const source = args;
                
                if (name === 'kapruka_search_products') {
                  fixedArgs.q = source.q || source.query || source.search;
                  if (source.cursor) fixedArgs.cursor = source.cursor;
                } else if (name === 'kapruka_get_product') {
                  fixedArgs.product_id = source.product_id || source.id;
                } else if (name === 'kapruka_list_delivery_cities') {
                  if (source.q || source.query) fixedArgs.q = source.q || source.query;
                } else if (name === 'kapruka_check_delivery') {
                  fixedArgs.city = source.city;
                  fixedArgs.product_id = source.product_id || source.id;
                } else {
                  // Fallback: just copy everything
                  Object.assign(fixedArgs, source);
                }
                
                finalArgs = { params: fixedArgs };
              } else {
                // If LLM somehow output { params: { ... } }, still clean it for search and get
                const p = args.params;
                if (name === 'kapruka_search_products' && p.response_format) delete p.response_format;
              }
              
              return tool.execute(finalArgs, options);
            }
          }
        ])
      );

      // Stream LLM response with tool calling
      const result = streamText({
        model: nvidia.chatModel('meta/llama-3.1-70b-instruct'),
        system: SYSTEM_PROMPT + "\n\nIMPORTANT: When you have received tool results and are ready to reply to the user, you MUST output conversational text. DO NOT output JSON or a tool call format when speaking to the user.",
        messages: await convertToModelMessages(cleanMessages),
        maxSteps: 5,
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
