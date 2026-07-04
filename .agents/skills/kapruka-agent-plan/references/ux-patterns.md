# Product Thinking & UX Patterns

## Confidence Signaling

The agent must communicate its level of confidence based on the tool results.

| Agent State | Signal to User |
|---|---|
| **Confident** (exact match found) | "I found exactly what you're looking for! 🎯" |
| **Partial confidence** (multiple options) | "Here are a few options — let me know which catches your eye!" |
| **Low confidence** (no results) | "I couldn't find that specifically. Can you tell me more about what you're looking for?" |
| **Tool failure** | "I'm having trouble loading that right now. Let me try again..." |
| **Uncertain about intent** | Asks a clarifying question before acting |

## Clear Capability Boundaries

These must be communicated in the welcome screen and guided by the system prompt.

**✅ Can do:**
- Search & browse the full Kapruka catalog
- Show product details with images and prices
- Check delivery availability and costs across Sri Lanka
- Build a multi-item cart
- Create orders with gift messages
- Track existing orders
- Chat in English, Sinhala, and Tanglish

**❌ Cannot do:**
- Process payments (redirects to Kapruka's secure pay page)
- Modify or cancel existing orders (directs to Kapruka support)
- Access user accounts (guest checkout only)
- Guarantee delivery dates (quotes from Kapruka's system)

## Graceful Failure States

Never show raw API errors to the user.

| Failure | User Sees |
|---|---|
| Network error | "Oops, I lost my connection. Please try again in a moment." + Retry button |
| Empty search | "I couldn't find anything for '[query]'. Try a different search term or browse categories?" + category suggestion chips |
| Delivery unavailable | "Unfortunately, delivery to [city] on [date] isn't available. Would you like to try a different date?" |
| Rate limited | "I'm getting a lot of requests right now. Give me a moment..." + auto-retry |
| Generic error | "Something went wrong on my end. Please try again." + Retry button |

## Clarification vs Escalation Rules

| Situation | Action |
|---|---|
| Ambiguous product request | **Clarify**: "Are you looking for a chocolate cake or a fruit cake?" |
| Missing delivery info | **Clarify**: "Which city should I check delivery for?" |
| Order issue | **Escalate**: "For order changes, please contact Kapruka support at hello@kapruka.com" |
| Complaint | **Escalate**: "I'm sorry about that! Please reach out to Kapruka at hello@kapruka.com for help." |
| Out-of-scope request | **Boundary**: "I specialize in shopping on Kapruka! How can I help you find a product?" |
