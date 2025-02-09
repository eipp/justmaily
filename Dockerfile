# Use an official Node.js runtime as the base image
FROM node:20-alpine

# Set the working directory inside the container
WORKDIR /usr/src/app

# Install Python 3 and pip
RUN apk add --no-cache python3 py3-pip

# Install Python dependencies (AI agent related libraries)
# Example dependencies - refine this list based on actual requirements
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy package files and install Node.js dependencies (use caching)
COPY package*.json ./
RUN npm install --production

# Copy the rest of the application code
COPY . .

# Build production assets if needed
RUN npm run build

# Expose the port on which your app will run
EXPOSE 3000

# Define environment variables for production (override via docker-compose if needed)
ENV NODE_ENV production

# Start the application
CMD ["npm", "start"]