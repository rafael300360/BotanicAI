import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
  return {
    base: '/BotanicAI/',
    plugins: [react(), tailwindcss()],
    define: {
      'process.env': {},
      'import.meta.env.VITE_G_ENC': JSON.stringify(
        Buffer.from(
          (env.VITE_GEMINI_OBFUSCATED || '').startsWith('SACAESTO_')
            ? (env.VITE_GEMINI_OBFUSCATED || '').substring(9)
            : env.VITE_GEMINI_API_KEY || ''
        ).toString('base64')
      ),
      'import.meta.env.VITE_OPENROUTER_API_KEY': JSON.stringify(env.VITE_OPENROUTER_API_KEY),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify — file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
    },
  };
});
