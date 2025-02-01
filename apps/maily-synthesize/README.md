# Maily-Synthesize Service

The content generation and personalization service for JustMaily platform.

## Features

- Dynamic content generation using multiple AI models
- Document parsing and analysis
- Personalized document creation
- Integration with Vercel AI SDK
- Secure code execution with E2B

## Tech Stack

- Node.js/TypeScript
- Vercel AI SDK
- AI Models:
  - DeepSeek v3
  - OpenAI GPT-4
  - Claude 3.5 Sonnet
  - Gemini 2.0
- E2B for code execution
- Document Processing:
  - Tesseract OCR
  - OpenPyXL
  - python-pptx
  - OpenCV/Pillow
  - ReportLab

## Development

1. Install dependencies: `pnpm install`
2. Configure environment variables
3. Start development server: `pnpm dev`

## API Endpoints

- `POST /api/synthesize/generate` - Generate content
- `POST /api/synthesize/parse` - Parse documents
- `POST /api/synthesize/personalize` - Create personalized documents 