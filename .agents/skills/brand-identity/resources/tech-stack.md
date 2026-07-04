# Preferred Tech Stack & Implementation Rules

When generating code or UI components for the Kapruka AI Shopping Agent, you **MUST** strictly adhere to the following technology choices.

## Core Stack
* **Framework:** Next.js 15 (App Router, TypeScript)
* **Styling Engine:** Vanilla CSS (Mandatory. Do not use Tailwind CSS, styled-components, or CSS-in-JS unless explicitly asked.)
* **AI SDK:** Vercel AI SDK (`ai`, `@ai-sdk/google`, `@ai-sdk/mcp`)
* **Fonts:** Google Fonts — Roboto (loaded via `next/font/google`)
* **Icons:** Emoji-based (no icon library dependency)

## Implementation Guidelines

### 1. CSS Usage
* Use a single `globals.css` file with CSS custom properties (variables) for all design tokens.
* All color values MUST reference CSS variables (e.g., `var(--color-primary)`) — never hardcode hex values inline.
* Use CSS custom properties derived from `design-tokens.json`:
  - `--color-primary: #0D6EFD`
  - `--color-accent: #402970`
  - `--color-background: #FFFFFF`
  - `--color-text-primary: #111111`
  - `--color-link: #402970`
  - `--color-border: #E3E1EA`
  - `--color-muted: #F7F5FA`
  - `--color-success: #1A8A3D`
* **Dark Mode:** Not required for this project. Light color scheme only.

### 2. Component Patterns
* **Buttons:** Primary actions must use the accent color `#402970` with white text and pill-shaped border-radius (`50px`). Secondary actions should use a ghost/outline variant with accent color border.
* **Inputs:** White background, `5px` border-radius on all corners, no box-shadow.
* **Cards:** White background, subtle border (`#E3E1EA`), `5px` border-radius, no heavy shadows.
* **Layout:** Use Flexbox and CSS Grid for all layout structures. Mobile-first responsive design.

### 3. Typography Rules
* **Font family:** Roboto for ALL text — headings, body, and paragraphs.
* **Font sizes:** H1 = 22px, H2 = 12px, Body = 15px (as per brand spec).
* **Font weights:** Bold (700) for headings, Semibold (600) for emphasis, Regular (400) for body.

### 4. Forbidden Patterns
* Do NOT use Tailwind CSS.
* Do NOT use jQuery.
* Do NOT use Bootstrap.
* Do NOT use styled-components or CSS-in-JS.
* Do NOT use icon libraries (Lucide, Font Awesome, etc.) — use emoji or SVG.
* Do NOT hardcode color hex values in component files — always use CSS variables.
