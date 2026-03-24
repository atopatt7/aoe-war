/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false, // Phaser 不相容 StrictMode 雙重渲染

  // 避免 Vercel 因 lint/ts 設定不同而中斷 build
  eslint:     { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors:  true },

  webpack: (config, { isServer }) => {
    // Phaser 需要在 client 端執行，排除 server-side
    if (isServer) {
      config.externals = [...(config.externals || []), 'phaser'];
    }
    return config;
  },
};

module.exports = nextConfig;
