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
  webpack(config) {
    // let every *.svg file imported from JS/TS become a React component
    config.module.rules.push({
      test: /\.svg$/i,
      issuer: /\.[jt]sx?$/,
      use: [
        {
          loader: "@svgr/webpack",
          options: {
            icon: true, // <svg width="1em" height="1em" … />
            ref: true,
            svgo: true,
            titleProp: true,
          },
        },
      ],
    });

    return config;
  },
};

module.exports = nextConfig;
