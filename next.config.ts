import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      // 以旧换新曾经有两个入口（/trade-in 与 /features/trade-in），两页内容几乎逐字重复。
      // 现已合并到 /trade-in，旧地址做永久跳转，避免历史链接 404。
      {
        source: "/features/trade-in",
        destination: "/trade-in",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
