import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 显式固定文件追踪根目录，避免 Next.js 因多份 lockfile 误判工作区根路径。
  outputFileTracingRoot: process.cwd(),
};

export default nextConfig;
