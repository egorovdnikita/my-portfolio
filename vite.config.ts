import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Сайт публикуется на GitHub Pages по адресу /my-portfolio/
export default defineConfig({
  base: '/my-portfolio/',
  plugins: [react()],
});
