# Maily-Synthesize Service
## Autonomous Content Generation & Personalization

Maily-Synthesize is a core service of Maily – an AI-first email marketing platform where autonomous AI agents design, execute, and optimize hyper-personalized campaigns. Leveraging self-hosted, fine-tunable LLMs (DeepSeek R1 with LoRA adapters) as the base model, with fallback inference via Fireworks.ai, and dynamic tool generation via GPT-Engineer, Maily-Synthesize delivers adaptive content creation, real-time personalization, and ethical, secure code execution guided by NeMo Guardrails.

### Features
- **Dynamic Content Generation:** Uses autonomous AI agents to craft personalized email content.
- **Hyper-Personalization:** Integrates zero-party data and real-time feedback for tailored campaign creation.
- **Fine-Tunable LLMs:** Powered by DeepSeek R1 with efficient LoRA fine-tuning; model-agnostic architecture supports seamless switching to Claude 3.5 Sonnet, Llama 3.1, and more.
- **Autonomous Tool Creation:** Leverages GPT-Engineer to generate and update missing tools and integrations on demand.
- **Ethical & Secure:** Enforces ethical guardrails via NeMo Guardrails and complies with GDPR/CCPA through integrated privacy mechanisms.

### Tech Stack
- **Runtime:** Node.js with TypeScript
- **AI SDK:** Vercel AI SDK and unified inference via Fireworks.ai
- **Models:** Primary model: DeepSeek R1; fallback and additional support via Claude 3.5 Sonnet, Gemini 2.0, etc.
- **Execution:** E2B for secure code execution

### Development
1. Install dependencies: `pnpm install`
2. Configure environment variables (make sure to set AI and compliance configurations)
3. Start the development server: `pnpm dev`

### API Endpoints
- `POST /api/synthesize/generate` — Generate personalized email content driven by autonomous AI agents.
- `POST /api/synthesize/parse` — Parse and process input documents.
- `POST /api/synthesize/personalize` — Apply user preferences to generate personalized documents.

### Alignment with Maily Vision
This service embodies Maily's strategic objectives to achieve agent autonomy, model agnosticism, and ethical, self-improving workflows. It underpins our mission to empower marketers with adaptive, infinitely customizable email experiences powered by autonomous AI agents. 