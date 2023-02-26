/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  webpack: (config) => {
    // Add GSLX loader for *.vert and *.frag files
    config.module.rules.push({
      test: /\.(vert|frag)$/,
      use: ["glslify-import-loader", "raw-loader", "glslify-loader"],
    });

    return config;
  },
};

module.exports = nextConfig;
