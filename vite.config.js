import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  // use the *exact* repo name between the slashes
  base: './',        // or '/gloup-soup/' if that is the repo
  plugins: [react()],
});
