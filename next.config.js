const withTM = require("next-transpile-modules")(["gsap"]);

module.exports = withTM({
  webpack: (config) => {
    // Add GSLX loader for *.vert and *.frag files
    config.module.rules.push({
      test: /\.(vert|frag)$/,
      use: ["glslify-import-loader", "raw-loader", "glslify-loader"],
    });

    return config;
  },
});
