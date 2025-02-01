# Quick Start Guide

## Prerequisites

- Node.js 18 or later
- PostgreSQL 14 or later
- Redis 6 or later
- Supabase account
- OpenAI API key

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/maily.git
cd maily
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

Edit `.env.local` with your configuration:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
OPENAI_API_KEY=your_openai_api_key
REDIS_URL=your_redis_url
```

4. Initialize the database:
```bash
npm run db:migrate
npm run db:seed
```

## Running the Application

1. Start the development server:
```bash
npm run dev
```

2. Open [http://localhost:3000](http://localhost:3000) in your browser

## First Steps

1. **Create an Account**
   - Sign up at [http://localhost:3000/auth/signup](http://localhost:3000/auth/signup)
   - Verify your email address
   - Set up MFA (recommended)

2. **Create Your First Project**
   - Click "New Project" on the dashboard
   - Enter project details
   - Configure project settings

3. **Generate Your First Email**
   - Navigate to "Content Generation"
   - Select a template or start from scratch
   - Enter your requirements
   - Review and edit the generated content

4. **Send a Test Email**
   - Configure SMTP settings
   - Add test recipients
   - Send a test email

## Next Steps

- Read the [Core Concepts](../concepts/README.md) guide
- Explore the [API Documentation](../api/README.md)
- Set up [Production Deployment](../deployment/production.md)

## Troubleshooting

### Common Issues

1. **Database Connection Issues**
   ```
   Error: Could not connect to database
   ```
   - Check PostgreSQL is running
   - Verify database credentials in .env.local
   - Ensure database exists

2. **Redis Connection Issues**
   ```
   Error: Could not connect to Redis
   ```
   - Check Redis is running
   - Verify Redis URL in .env.local
   - Check Redis authentication

3. **API Key Issues**
   ```
   Error: Invalid API key
   ```
   - Verify OpenAI API key in .env.local
   - Check API key permissions
   - Monitor rate limits

### Getting Help

- Check the [FAQ](./faq.md)
- Join our [Discord community](https://discord.gg/maily)
- Open an issue on GitHub

## Security Notes

- Never commit .env files
- Use strong passwords
- Enable MFA
- Regularly rotate API keys
- Monitor access logs