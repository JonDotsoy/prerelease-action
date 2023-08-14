// rollup.config.js

/**
 * @type {import('rollup').RollupOptions}
 */
const config = {
  /* your config */
  input: ['./src/action.ts'],
  plugins: [require("@rollup/plugin-typescript")],
  output: {
    dir: "dist",
    format: "module"
  },
};

module.exports = config;
