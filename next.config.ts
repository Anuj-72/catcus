import type { NextConfig } from "next";

// No experimental flags: every route here is session-dependent, so the default
// dynamic rendering behaviour is what we want.
const nextConfig: NextConfig = {
  // Keeps the dev overlay badge out of the 2880x1800 screenshots.
  devIndicators: false,
};

export default nextConfig;
