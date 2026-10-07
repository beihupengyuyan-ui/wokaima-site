import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 用手机或另一台电脑通过局域网地址（http://192.168.110.218:3000）调试时，
  // Next.js 16 默认会拦截跨源的 dev 资源与端点，日志里会看到
  // "Blocked cross-origin request to Next.js dev resource /_next/hmr from 192.168.110.218"。
  // 只填 hostname，不带协议和端口（见 dist/docs 中的 allowedDevOrigins）。
  allowedDevOrigins: ["192.168.110.218"],
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
