import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';
import {VitePWA} from 'vite-plugin-pwa';

export default defineConfig(() => {
  return {
    plugins: [
      react(),
      tailwindcss(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['shield.svg'],
        manifest: {
          id: '/',
          name: 'ScamShield AI',
          short_name: 'ScamShield',
          description: 'AI-powered cybersecurity scanner and fraud prevention platform: Think Before You Click.',
          theme_color: '#0B0F19',
          background_color: '#070B14',
          display: 'standalone',
          start_url: '/',
          scope: '/',
          icons: [
            {
              src: '/shield.svg',
              sizes: '192x192 512x512',
              type: 'image/svg+xml',
              purpose: 'any'
            }
          ]
        },
        devOptions: {
          enabled: true,
          type: 'module'
        }
      })
    ],
    resolve: {
      alias: {
        '@': path.resolve(process.cwd(), '.'),
      },
    },
    server: {
      host: '0.0.0.0',
      port: 3000,
      hmr: false,
    },
  };
});
