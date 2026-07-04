---
name: kapruka-competition-strategy
description: "Optimizes agent output, UI generation, and code implementation to maximize the score in the Kapruka Agent Challenge. Use when evaluating the project against competition criteria or when deciding which features to prioritize during development."
---

# Kapruka Agent Challenge — Scoring Strategy

## When to use this skill
- When prioritizing which features to build next
- When designing the user interface (UI) and user experience (UX)
- When writing system prompts for the agent's personality
- When evaluating the final project before submission

## Core Scoring Rubric (Out of 100)

Your decisions should maximize these exact criteria used by the Kapruka tech team judges:

1. **Experience & Polish (30 points - HIGHEST PRIORITY)**
   - **Goal:** Does it look and feel genuinely amazing?
   - **Action:** Ensure flawless CSS styling, smooth transitions, responsive design, and intuitive UX. No broken layouts or awkward interactions.

2. **Visual Richness (20 points)**
   - **Goal:** Products shown beautifully — not a wall of text.
   - **Action:** Render product cards, images, and carousels. Never output raw JSON or long lists of text for search results.

3. **Personality (15 points)**
   - **Goal:** An agent people actually enjoy talking to.
   - **Action:** The system prompt must instruct the agent to be warm, witty, and culturally relevant (Sri Lankan context).

4. **Usefulness (15 points)**
   - **Goal:** Does it really help someone shop and decide?
   - **Action:** Handle edge cases gracefully (e.g., out-of-stock items, invalid delivery cities) and offer smart alternatives.

5. **End-to-End Completeness (15 points)**
   - **Goal:** Discovery all the way through to a working checkout.
   - **Action:** The user flow must seamlessly transition from searching -> viewing product -> adding to cart -> checking delivery -> generating the final pay link.

6. **Creativity (5 points)**
   - **Goal:** Show us something we didn't see coming.
   - **Action:** Implement a unique feature that goes beyond standard e-commerce chatbots.

## Bonus Points (The Differentiators)

To pull ahead of the pack and win the Apple M4 Mac Mini, you MUST implement these bonus features:

- [ ] **Multi-item carts:** Implement robust client-side cart state management.
- [ ] **Delivery-date constraints:** Use the `kapruka_check_delivery` tool to validate dates and cities.
- [ ] **Gift messaging:** Include the `gift_message` field in the checkout payload.
- [ ] **Tanglish conversation:** Ensure the agent can understand and occasionally respond in Tanglish (Tamil/English hybrid common in Sri Lanka).
- [ ] ⭐ **Sinhala-language support:** (Critical Bonus) The agent must seamlessly understand and respond in Sinhala script. This is highly emphasized by the judges.

## Strategic Guidelines

1. **Do not cut corners on the frontend.** 50% of the score (Polish + Richness) is purely visual and experiential. A beautifully designed UI with a simple agent beats a complex agent with a plain text UI.
2. **Prioritize Sinhala.** Integrate multilingual support into the core system prompt immediately, not as an afterthought.
3. **End-to-End Reliability.** Ensure the guest checkout flow (`kapruka_create_order`) works flawlessly, as failure here zeroes out the "Completeness" score.
