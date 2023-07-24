/** @type {import('next').NextConfig} */
const nextConfig = {
  httpAgentOptions: {
    keepAlive: false,
  },
  experimental: {
    appDir: true,
    serverComponentsExternalPackages: ["mysql2", "prisma", "@prisma/client"]
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "image.tmdb.org",
        port: "",
        pathname: "**"
      },
      {
        protocol: "https",
        hostname: "www.themoviedb.org",
        port: "",
        pathname: "**"
      },
      {
        protocol: "https",
        hostname: "**.cloudfront.net"
      },
      {
        protocol: "https",
        hostname: "bizweb.dktcdn.net"
      }
    ]
  },
  async headers() {
    return [
      {
        // matching all API routes
        source: "/(.*)",
        headers: [
          { key: "Access-Control-Allow-Credentials", value: "true" },
          { key: "Access-Control-Allow-Origin", value: "*" },
          {
            key: "Access-Control-Allow-Methods",
            value: "*",
          },
          {
            key: "Access-Control-Allow-Headers",
            value:
              "*",
          },
        ],
      },
    ]
  }
};

module.exports = nextConfig;
