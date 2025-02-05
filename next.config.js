const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true, // Enable the new app directory if needed
    turbopack: true // Enable Turbopack for faster builds and refresh
  },
  webpack: (config, { isServer }) => {
    config.resolve.alias['@'] = path.join(__dirname, '.');
    config.resolve.alias['@/lib'] = path.join(__dirname, 'lib');
    config.resolve.alias['@/components'] = path.join(__dirname, 'components');
    config.resolve.alias['@supabase/ssr'] = path.join(__dirname, 'lib', 'supabase-ssr', 'index.js');
    config.resolve.alias['@/lib/security'] = path.join(__dirname, 'lib', 'security.ts');
    config.resolve.alias['@/lib/api'] = path.join(__dirname, 'lib', 'api');
    config.resolve.alias['@vercel/speed-insights/next'] = path.join(__dirname, 'lib', 'vercel-speed-insights-placeholder.js');
    return config;
  }
};

module.exports = nextConfig; 