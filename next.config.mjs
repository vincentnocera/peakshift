/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { dev, isServer }) => {
    config.resolve.alias.canvas = false;
    config.resolve.alias.encoding = false;

    // Disable webpack caching in development
    if (dev) {
      config.cache = false;
    }

    return config;
  },
};

export default nextConfig;
