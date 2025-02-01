# Use an official Node.js runtime as the base image
FROM node:16-alpine

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy package files and install dependencies (use caching)
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