import { defineConfig } from 'vite';

// base: './' keeps asset URLs relative so the build works both at a domain
// root (Vercel) and under a sub-path (GitHub Pages: /<repo>/).
export default defineConfig({
  base: './',
  build: {
    target: 'es2020',
    outDir: 'dist',
  },
});
