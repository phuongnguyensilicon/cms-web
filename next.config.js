/** @type {import('next').NextConfig} */
const path = require('path');
const nextConfig = {
  experimental: {
    appDir: true
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'image.tmdb.org',
        port: '',
        pathname: '**'
      },
      {
        protocol: 'https',
        hostname: 'www.themoviedb.org',
        port: '',
        pathname: '**'
      },
      {
        protocol: 'https',
        hostname: '**.googleusercontent.com'
      },
      {
        protocol: 'https',
        hostname: '**.fbsbx.com'
      },
      {
        protocol: 'https',
        hostname: '**.fbcdn.net'
      },
      {
        protocol: 'https',
        hostname: '**.gravatar.com'
      },
      {
        protocol: 'https',
        hostname: '**.auth0.com'
      },
      {
        protocol: 'https',
        hostname: '**.cloudfront.net'
      },
      {
        protocol: 'https',
        hostname: 'i.**'
      },
      {
        protocol: 'https',
        hostname: 'gvthumbnail.zype.com'
      }
    ]
  },
  sassOptions: {
    includePaths: [path.join(__dirname, 'src/scss')]
  }
};

module.exports = nextConfig;
