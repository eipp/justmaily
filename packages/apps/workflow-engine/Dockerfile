# apps/workflow-engine/Dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package.json and install dependencies
COPY package.json package-lock.json* ./
RUN npm install --production

# Copy the rest of the source code
COPY . .

EXPOSE 3000

# Healthcheck for Kubernetes to monitor container health
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 CMD curl --fail http://localhost:3000/health || exit 1

CMD ["node", "index.js"] 