import type { NextConfig } from "next";
import crypto from "crypto";

const nextConfig: NextConfig = {
  output: "standalone",
  generateBuildId: async () => {
    return crypto.randomBytes(8).toString("hex");
  },
};

export default nextConfig;
