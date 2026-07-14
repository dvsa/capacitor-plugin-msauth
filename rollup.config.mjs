export default {
  input: 'dist/esm/index.js',
  output: [
    {
      file: 'dist/plugin.js',
      format: 'iife',
      name: 'capacitorMsAuth',
      globals: {
        '@capacitor/core': 'capacitorExports',
        // Keep MSAL external in browser bundles; host apps provide it via dependency resolution.
        '@azure/msal-browser': 'msalBrowser',
      },
      sourcemap: true,
      inlineDynamicImports: true,
    },
    {
      file: 'dist/plugin.cjs.js',
      format: 'cjs',
      sourcemap: true,
      inlineDynamicImports: true,
    },
  ],
  // Do not inline runtime peer/runtime deps into the plugin bundle.
  external: ['@capacitor/core', '@azure/msal-browser'],
};
