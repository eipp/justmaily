# Getting Started

Welcome to Maily! This guide will walk you through the process of setting up the project on your local machine.

## Prerequisites

- [Node.js](https://nodejs.org/) (version 16 or later)
- [Git](https://git-scm.com/)
- [Docker](https://www.docker.com/) and [Docker Compose](https://docs.docker.com/compose/) if you plan to run the containerized version

## Installation

1. **Clone the Repository**

   ```bash
   git clone https://github.com/yourusername/maily.git
   cd maily
   ```

2. **Install Dependencies**

   ```bash
   npm install
   ```

3. **Configuration**

   - Create a local configuration file for environment variables (refer to `apps/maily-analyze/env-vars.js` for structure).
   - Set up your database credentials and other secrets in the file (or use your preferred local secrets management tool).

4. **Run the Application Locally**

   ```bash
   npm start
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser to verify the app is running.

## Running Tests and Linters

Before submitting any code changes, run the following commands:

```bash
npm run lint
npm test
```

## Next Steps

- Check out the [Development Guide](../development/README.md) for more details on setting up your development environment and contributing.
- Read the [API Reference](../api/README.md) for more details on API endpoints and integrations.

Happy Coding! 