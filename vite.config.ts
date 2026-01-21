import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, (process as any).cwd(), '');

  return {
    plugins: [react()],
    define: {
      // Polyfill vital para evitar "ReferenceError: process is not defined"
      'process.env': JSON.stringify(env),
      'process.version': JSON.stringify((process as any).version),
      'process.browser': 'true',
      // Define 'process' como um objeto vazio para segurança extra
      'global': 'window',
    },
    build: {
      outDir: 'build', 
      emptyOutDir: true
    },
    server: {
      port: 5173,
      proxy: {
        '/api': {
          target: 'http://localhost:3000',
          changeOrigin: true,
          secure: false
        }
      }
    }
  };
});