/** @type {import('next').NextConfig} */
const nextConfig = {
    eslint: {
      // Vercel build: don't fail on lint errors
      ignoreDuringBuilds: true,
    },
  };
  
  module.exports = nextConfig;
  