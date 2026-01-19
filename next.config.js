/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  // Enable experimental features for better Docker support
  experimental: {
    // Reduce memory usage in production
  },
};

module.exports = nextConfig;
