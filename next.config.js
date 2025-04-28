/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  experimental: {
    reactRoot: true,
  },
  // eslint: {
  //   ignoreDuringBuilds: true,
  // },
  images: {
    domains: ["2ndkz.s3.eu-north-1.amazonaws.com"],
  },
};

module.exports = nextConfig;
