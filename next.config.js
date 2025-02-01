/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true, // Enable the new app directory if needed
    turbopack: true // Enable Turbopack for faster builds and refresh
  }
};

module.exports = nextConfig; 