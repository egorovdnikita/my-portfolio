import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Сайт публикуется на собственном домене egorovdnikita.ru.
export default defineConfig({
  base: '/',
  plugins: [react()],
});
