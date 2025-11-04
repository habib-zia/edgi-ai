import type { NextConfig } from "next";

const securityHeaders = [
  { key: "X-DNS-Prefetch-Control", value: "on" },
  { key: "X-XSS-Protection", value: "1; mode=block" },
  { key: "X-Content-Type-Options", value: "nosniff" },
];

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "img.youtube.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "files2.heygen.ai",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "resource2.heygen.ai",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "*.heygen.ai",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "socialbu.nyc3.digitaloceanspaces.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "media.licdn.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "scontent.cdninstagram.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "scontent-*.cdninstagram.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "scontent-*.fbcdn.net",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "pbs.twimg.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "abs.twimg.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "cdninstagram.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "fbcdn.net",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "twimg.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "licdn.com",
        pathname: "/**",
      },
    ],
  },

  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },

  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://13.60.180.94:4000/api/:path*", // backend server
      },
    ];
  },

  poweredByHeader: false, // hide "x-powered-by"
  serverExternalPackages: ["dompurify"],
};

export default nextConfig;
