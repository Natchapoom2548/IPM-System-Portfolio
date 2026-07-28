import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    build: {
      chunkSizeWarningLimit: 1200,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              // Exclude heavy export-specific libraries so they can be loaded dynamically on demand
              if (
                id.includes('xlsx') ||
                id.includes('jspdf') ||
                id.includes('jspdf-autotable') ||
                id.includes('pdfjs-dist') ||
                id.includes('fflate')
              ) {
                return; // This tells Vite/Rollup to chunk them naturally based on dynamic imports
              }

              // Group core framework dependencies to prevent circular dependencies and optimize caching
              if (
                id.includes('react') ||
                id.includes('react-dom') ||
                id.includes('scheduler') ||
                id.includes('motion') ||
                id.includes('lucide')
              ) {
                return 'vendor-core';
              }
              
              return 'vendor-others';
            }
          }
        }
      }
    },
    server: {
      // HMR and file watching can be disabled in constrained development environments.
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
