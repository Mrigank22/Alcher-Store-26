import { withPayload } from "@payloadcms/next/withPayload";
import type { NextConfig } from "next";
import path from 'path';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "**.unsplash.com",
      },
      {
        protocol: "http",
        hostname: "localhost",
      },
      {
        protocol: "https",
        hostname: "*.cloudinary.com",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
    ],
  },
  webpack: (config) => {
    config.resolve.alias['@payload-config'] = path.resolve(
        __dirname,
        'payload.config.ts'
    )
    return config
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default withPayload(nextConfig);
