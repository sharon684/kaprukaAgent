---
name: building-kapruka-agent
description: "Provides the complete engineering blueprint for the Kapruka AI Shopping Agent project. Use when implementing any component of the agent — backend API routes, MCP client integration, frontend chat UI, system prompt, error handling, security, or testing. Covers system design, tool contracts, reliability, security, observability, and UX patterns."
---

# Kapruka AI Shopping Agent — Development Plan

## When to use this skill
- Building or modifying any component of the Kapruka AI Shopping Agent
- Implementing the backend API route with MCP client and Gemini
- Creating or updating the frontend chat UI
- Writing the system prompt or agent personality
- Adding error handling, retry logic, or security measures
- Writing tests or verifying agent behavior
- Deploying to Vercel

## Architecture Overview

Single-LLM multi-step agent using Gemini 2.0 Flash + Vercel AI SDK + Kapruka MCP.

```
User Browser → Next.js Frontend (Chat UI) → API Route (/api/chat) → MCP Client → Kapruka MCP Server
                                                                   → Gemini 2.0 Flash (reasoning + tool selection)
```

**Data flow per request:**
1. User types message → `POST /api/chat {messages[]}`
2. API route creates MCP client → `createMCPClient({ transport: { type: 'http', url: 'https://mcp.kapruka.com/mcp' } })`
3. Discovers tools → `mcpClient.tools()` returns 7 tools in AI SDK format
4. Streams to Gemini → `streamText({ model, messages, tools, maxSteps: 8 })`
5. Gemini calls tools → SDK auto-executes via MCP → feeds results back
6. Final response streamed → frontend renders rich content
7. MCP client closed → `mcpClient.close()` in `finally` block

## Component Inventory

| Component | Technology | Role |
|---|---|---|
| LLM | Google Gemini 2.0 Flash | Reasoning, tool selection, multilingual responses |
| AI Orchestrator | Vercel AI SDK (`streamText`) | Multi-step tool loop, streaming |
| MCP Client | `@ai-sdk/mcp` (built-in HTTP transport) | Tool discovery and execution |
| MCP Server | `mcp.kapruka.com/mcp` | 7 e-commerce tools |
| Cart State | Client-side React `useReducer` | Multi-item cart per session |
| Frontend | Next.js 15 App Router + Vanilla CSS | Full-screen chat UI |
| Hosting | Vercel Hobby (free) | Serverless deployment |

## File Structure

```
kapruka/
├── app/
│   ├── layout.tsx              # Root layout, fonts, meta
│   ├── page.tsx                # Full-screen chat page
│   ├── globals.css             # Design system (CSS variables)
│   └── api/
│       └── chat/
│           └── route.ts        # AI + MCP orchestration
├── components/
│   ├── ChatMessage.tsx         # Rich message renderer (product cards, CTAs)
│   ├── ProductCard.tsx         # Product display card
│   ├── WelcomeScreen.tsx       # First-load experience with suggestions
│   └── TypingIndicator.tsx     # Loading animation
├── lib/
│   ├── system-prompt.ts        # Agent personality + security rules
│   ├── message-parser.ts       # Parse structured content → React components
│   └── cart.ts                 # Cart state management (useReducer)
├── .env.local                  # GOOGLE_GENERATIVE_AI_API_KEY
├── next.config.js
├── package.json
└── tsconfig.json
```

## Implementation Details

For detailed specifications on each engineering pillar, consult:

### System Design & Failure Behavior
👉 **[`references/system-design.md`](references/system-design.md)**
Failure behavior matrix, coordination logic, component failure modes.

### Tool Contracts (MCP Schema Reference)
👉 **[`references/tool-contracts.md`](references/tool-contracts.md)**
Strict schemas for all 7 Kapruka MCP tools with types, examples, and return shapes.

### Reliability Engineering
👉 **[`references/reliability.md`](references/reliability.md)**
Retry logic, timeouts, fallback paths, circuit breaker pattern.

### Security & Safety
👉 **[`references/security.md`](references/security.md)**
Input validation, output filters, permission boundaries, prompt injection resistance.

### Evaluation & Testing
👉 **[`references/evaluation.md`](references/evaluation.md)**
Trace logging schema, 8 test scenarios, metrics, regression gate.

### UX Patterns
👉 **[`references/ux-patterns.md`](references/ux-patterns.md)**
Confidence signaling, capability boundaries, graceful failures, clarification vs escalation rules.

## Build Priority Checklist

- [ ] Step 1: Initialize Next.js project with dependencies
- [ ] Step 2: Create backend API route (`app/api/chat/route.ts`) with MCP client + Gemini
- [ ] Step 3: Write system prompt (`lib/system-prompt.ts`)
- [ ] Step 4: Build frontend chat UI (`app/page.tsx`, components)
- [ ] Step 5: Implement CSS design system (`app/globals.css`)
- [ ] Step 6: Add error handling, retries, timeouts
- [ ] Step 7: Add input validation and security guards
- [ ] Step 8: Test all 8 scenarios manually
- [ ] Step 9: Deploy to Vercel
