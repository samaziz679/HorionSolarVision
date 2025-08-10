/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Your Next.js configuration options go here.
  // For example, to add experimental features:
  // experimental: {
  //   serverActions: true,
  // },
};

export default nextConfig;
