/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone', // Required for Docker: produces .next/standalone with server.js
  reactStrictMode: true,
  transpilePackages: [],
  webpack: (config) => {
    // Required for Solana wallet adapter
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    };
    return config;
  },
};

module.exports = nextConfig;
