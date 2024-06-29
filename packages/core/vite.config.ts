import { defineConfig } from 'vitest/config'
import react from "@vitejs/plugin-react";
import dts from 'vite-plugin-dts'

export default defineConfig({
  build: {
    lib: {
      name: 'st-css-core',
      entry: 'src/index.ts',
    },
    rollupOptions: {
      external: ['react', 'react/jsx-runtime'],
      output: {
        sourcemapExcludeSources: true,
        globals:  {
            react: 'React',
            'react/jsx-runtime': 'jsxRuntime'
        }
      },
    },
    sourcemap: true,
    target: 'esnext',
    minify: true,
  },
  plugins: [react(), dts({ rollupTypes: true })],
  test: {
    globals: true,
    environment: 'jsdom'
  }
});
