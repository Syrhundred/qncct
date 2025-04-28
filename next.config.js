/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false, // Выключает строгий режим
  experimental: {
    reactRoot: true, // Позволяет использовать новые React функции, включая CSR
  },
  images: {
    domains: ["2ndkz.s3.eu-north-1.amazonaws.com"],
  },
};

module.exports = nextConfig;
