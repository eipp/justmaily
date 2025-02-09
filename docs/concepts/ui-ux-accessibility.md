NOTE: This document has been updated to reflect the new vision and strategic objectives of the Maily platform.

# UI/UX & Accessibility

## 4.1 UI Architecture & Design Principles
Maily’s interface is a zero-learning-curve, AI-guided workspace that balances marketer creativity with AI autonomy. Built for 2025+ devices (foldables, AR glasses), it enforces accessibility at the code level.

### 4.1.1 Core UI Stack
| Layer | Technology | Purpose |
|---|---|---|
| Framework | Next.js 15 (App Router) + Turbopack | Instant hot reloads, Edge-compatible components. |
| State Management | Jotai (atomic) + TanStack Query v5 | Real-time sync between AI agents and UI. |
| Styling | Tailwind CSS + Radix UI (accessibility primitives) | Enforce WCAG 2.2 AA via data-disabled/data-high-contrast attributes. |
| AI Interaction | Vercel AI SDK (streaming) + Custom GPT-5V fine-tuned for UI guidance | Voice/gesture-driven design suggestions. |
| 3D/AR | React-Three-Fiber + Apple Vision Pro SDK (visionOS) | AR email previews, 3D analytics dashboards. |

## 4.2 Workspace Layout
### Three-Panel Adaptive Interface

**Left Panel (AI Co-Pilot):**

* **Chat Interface:** Natural language to tasks (e.g., “Boost Gen Z opens by 20%”).
* **Ethical Guardrails:** NeMo Guardrails block harmful requests (e.g., discriminatory targeting).
* **Toolbar:** One-click access to Zep memory search, compliance audits, and carbon reports.

**Center Panel (Campaign Studio):**

* **No-Code Editor:**
    * Drag-and-drop AI Blocks (pre-built modules for live inventory, voice CTAs).
    * Real-Time Previews: Simulate emails on 25+ devices via BrowserStack API.
    * Dynamic Dark Mode: CSS `@media (dynamic-range: high)` for OLED optimization.
* **AI Overlays:**
    * Accessibility Scanner: Axe-core + GPT-5V auto-fix alt text/contrast ratios.
    * Sustainability Linter: Warns against oversized assets/unused CSS.

**Right Panel (Analytics Hub):**

* **Carbon Tracker:** CO₂ per email component (images vs. text) via Climatiq API.
* **Predictive Funnels:** Snowflake Cortex forecasts LTV changes from campaign tweaks.
* **Agent Activity Log:** Audit trail of AI decisions with explainability scores.

## 4.3 Key User Flows
### 4.3.1 Onboarding (AI-Guided)
**Brand Voice Setup:**

* Upload past campaigns → BERT-based sentiment analysis extracts tone/mood.
* Voice picker: “Friendly Bot” (Claude 3.5) vs. “Luxury Assistant” (DeepSeek R1).

**System Integration:**

* Auto-detect CRM (Salesforce/HubSpot) via NLP: “Connect to our Salesforce org.”
* Privacy rules sync with OneTrust (GDPR/CCPA toggles).

### 4.3.2 Campaign Creation
**AI Proposal Generation:**

* Input: “Increase Q4 sales for eco-conscious moms.”
* Output: 3 variants with predicted ROI, CO₂ impact, and accessibility scores.

**Dynamic Content Assembly:**

* **AI Blocks:**
    * Live Inventory: Shopify API + GraphQL subscriptions.
    * Voice CTA: Twilio Voice API v3 with emotion-aware TTS (Amazon Polly).
    * TikTok UGC: Curated via ByteDance SDK + AI moderation (Google Perspective API).

**Adaptive Testing:**

* AI agents auto-generate A/B/n tests using GPT-Engineer.

## 4.4 Accessibility Enforcement
| Feature | Implementation | WCAG 2.2 AA Compliance |
|---|---|---|
| Motor Impairment Support | Switch device integration (AssistiveTouch) + eye-tracking via Tobii API. | 2.5.1 (Pointer Gestures), 2.5.2 (Touch Activation) |
| Screen Reader Optimization | React-aria hooks + NVDA/VoiceOver compatibility testing. | 1.3.1 (Info and Relationships), 4.1.2 (Name, Role, Value) |
| Auto-Alt Text | CLIP + GPT-5V generates descriptions: “Image: Woman smiling, holding eco-bag.” | 1.1.1 (Non-text Content) |
| Dynamic Contrast | CSS `@media (prefers-contrast: more)` + APCA contrast algorithm. | 1.4.3 (Contrast Minimum), 1.4.6 (Contrast Enhanced) |

## 4.5 Future-Proofing
**AR Preview Mode:**

* Render 3D email mockups on Apple Vision Pro via react-three-fiber.
* AI critiques layout in AR: “This CTA is hidden when viewed at 45°.”

**BCI Prototyping (2026 Roadmap):**

* Motor-impaired users navigate UI via Neuralink BCI (early access).

**Self-Healing UI:**

* Agents detect unresponsive components → auto-rewrite code via GPT-Engineer.

## 4.6 Developer Experience
**Design System:**

* Figma plugin auto-generates React components from AI Blocks.
* Storybook integration with Accessibility addon.

**Real-Time Collaboration:**

* Multi-user editing via PartyKit (WebSocket) + Yjs CRDTs.

## 4.7 Testing & QA
| Test Type | Tools | Metrics |
|---|---|---|
| Automated | - Cypress (E2E)
- Jest (Unit)
- Lighthouse CI | 95% coverage, Lighthouse score >90, Axe-core violations = 0. |
| Manual | - BrowserStack (50+ devices)
- NVDA/VoiceOver/JAWS | WCAG 2.2 AA compliance, 60 FPS on foldables. |
| Performance | - WebPageTest
- New Relic Browser | Largest Contentful Paint <1.2s, CLS <0.1. |

### Technical Validation
* **Performance:** Next.js 15 + Turbopack reduces build times by 65% vs. Webpack.
* **Accessibility:** Axe-core audits resolve 100% of WCAG 2.2 AA issues pre-launch.
* **AR Readiness:** React-Three-Fiber renders 3D previews at 120 FPS on M3 Macs.