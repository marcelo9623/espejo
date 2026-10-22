import { defineConfig } from 'vite';
import path from 'node:path';

export default defineConfig({
  root: path.resolve(__dirname, 'src/renderer-public'),
  base: './',
  build: {
    outDir: path.resolve(__dirname, 'dist/renderer-public'),
    emptyOutDir: true,
  },
  server: { port: 5173, strictPort: true },
});
