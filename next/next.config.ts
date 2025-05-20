import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  i18n: {
    locales: ['en', 'uk'],
    defaultLocale: 'en',
  },
};

export default nextConfig;
