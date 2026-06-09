/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // We render external token logos via plain <img>, not next/image, so we don't
  // need remotePatterns at all. Leaving it unset avoids GHSA-9g9p-9gw9-jx7f
  // (Image Optimizer DoS via wildcard remotePatterns).
  images: { unoptimized: true },
  poweredByHeader: false,
  experimental: {
    instrumentationHook: true,
    serverComponentsExternalPackages: ['better-sqlite3'],
  },
};

export default nextConfig;
