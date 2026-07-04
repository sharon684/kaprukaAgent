# System Design & Failure Behavior

## Failure Behavior Matrix

| Component | Failure Mode | Detection | Behavior |
|---|---|---|---|
| **Gemini API** | 429 rate limit | HTTP 429 | Retry with exponential backoff (max 3), then show "I'm a bit busy, try again in a moment" |
| **Gemini API** | 500/503 | HTTP status | Retry 2x, then graceful error: "I'm having trouble thinking right now. Please try again." |
| **Gemini API** | Timeout | 30s deadline | Abort, show: "That took too long. Could you try a simpler question?" |
| **MCP Client** | Connection refused | Transport error | Return: "I can't reach Kapruka's servers right now. Please try again shortly." |
| **MCP Tool** | Invalid params | Error response | Log, retry with corrected params if possible, else explain to user |
| **MCP Tool** | Empty results | Empty array | Agent says "I couldn't find anything matching that. Could you try different terms?" |
| **MCP Server** | Rate limit (60/min) | HTTP 429 | Backoff + inform user: "I'm making too many requests. Let me slow down." |
| **Order Creation** | Failure | Error response | Show exact error, suggest retry, never silently fail on checkout |
| **Frontend** | Stream interrupted | `onError` callback | Show "Connection lost" with retry button |

## Coordination Logic

Single-LLM multi-step orchestration — no sub-agents needed.

**Example flow:**
```
Step 1: User says "Find me a birthday cake for delivery to Kandy tomorrow"
Step 2: Gemini calls kapruka_search_products(q="birthday cake")
Step 3: Gemini reviews results, calls kapruka_get_product(product_id=best_match)
Step 4: Gemini calls kapruka_check_delivery(city="Kandy", delivery_date="tomorrow", product_id=...)
Step 5: Gemini synthesizes all data → rich response with product card + delivery info
```

`maxSteps: 8` allows up to 8 reasoning cycles per user message — enough for: search → filter → get details → check delivery → create order.

## Context Management

| Strategy | Implementation |
|---|---|
| Conversation history | Full message array passed to Gemini via `useChat` hook |
| Tool results as context | Multi-step tool results automatically fed back by AI SDK |
| Cart state | Client-side `useReducer` — injected into system prompt |
| Session memory | Browser state only; no persistent DB for demo |

Gemini 2.0 Flash supports 1M tokens — truncate older messages at 50 exchanges if needed.
