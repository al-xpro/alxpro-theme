// @ts-check

const isProd = process.env.NODE_ENV === "production";

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    remotePatterns: [{ protocol: "https", hostname: "images.example.com" }],
  },
  async redirects() {
    return [
      {
        source: "/docs/:path*",
        destination: "https://docs.example.com/:path*",
        permanent: isProd,
      },
    ];
  },
  async headers() {
    return [{ source: "/(.*)", headers: [{ key: "X-Frame-Options", value: "DENY" }] }];
  },
};

export default nextConfig;
