// next.config.ts
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
  async rewrites() {
    return [
      {
        source: '/media/:path*',
        destination: '/api/media/:path*',
      },
      {
        source: '/invoices/:path*',
        destination: '/api/invoices/:path*',
      },
    ]
  },
  webpack: (config, { isServer }) => {
    config.resolve.alias['@payload-config'] = path.resolve(
        __dirname,
        'payload.config.ts'
    )

    // Mark pdfkit as external for server-side bundles
    if (isServer) {
      config.externals = config.externals || [];
      config.externals.push('pdfkit');
    }

    return config
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default withPayload(nextConfig);