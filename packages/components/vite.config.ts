import { defineConfig } from 'vitest/config'
import react from "@vitejs/plugin-react";
import stcss from '@st-css/rollup-plugin';

//import dts from 'vite-dts'

export default defineConfig({
  build: {
    lib: {
      name: 'st-css-components',
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
    minify: false,
  },
  plugins: [react(), stcss()]
})
