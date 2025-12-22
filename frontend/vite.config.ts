import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        // Unificamos al puerto 5173 para coincidir con la documentación/env
        port: 5173,
        host: '0.0.0.0',
        proxy: {
          '/api': {
            target: 'http://localhost:4000',
            changeOrigin: true,
            secure: false,
          },
          '/health': {
            target: 'http://localhost:4000',
            changeOrigin: true,
            secure: false,
          }
        }
      },
      plugins: [react()],
          build: {
            // Optimize chunk size
            chunkSizeWarningLimit: 1000,
            rollupOptions: {
              output: {
                // Advanced manual chunks strategy for optimal code splitting
                manualChunks: (id) => {
                  // Core React libraries - always needed
                  if (id.includes('node_modules/react/') || id.includes('node_modules/react-dom/')) {
                    return 'vendor-react';
                  }

                  // Charts library - used in multiple views
                  if (id.includes('node_modules/recharts')) {
                    return 'vendor-charts';
                  }

                  // Icons - used everywhere
                  if (id.includes('node_modules/lucide-react')) {
                    return 'vendor-icons';
                  }

                  // PDF generation - used in reports
                  if (id.includes('node_modules/jspdf')) {
                    return 'vendor-pdf';
                  }

                  // AI/Gemini - used in specific modules
                  if (id.includes('node_modules/@google/genai')) {
                    return 'vendor-ai';
                  }

                  // ERP module components
                  if (id.includes('components/erp/')) {
                    return 'module-erp';
                  }

                  // CRM module components
                  if (id.includes('components/crm/')) {
                    return 'module-crm';
                  }

                  // RH module components
                  if (id.includes('components/rh/')) {
                    return 'module-rh';
                  }

                  // Logistics module components
                  if (id.includes('components/logistics/')) {
                    return 'module-logistics';
                  }

                  // Common UI components
                  if (id.includes('components/ui/')) {
                    return 'shared-ui';
                  }

                  // Services layer
                  if (id.includes('services/')) {
                    return 'shared-services';
                  }

                  // Context providers
                  if (id.includes('context/') || id.includes('providers/')) {
                    return 'shared-context';
                  }

                  // Other node_modules
                  if (id.includes('node_modules/')) {
                    return 'vendor-other';
                  }
                },
                // Optimize asset file names
                assetFileNames: (assetInfo) => {
                  const info = assetInfo.name?.split('.');
                  let extType = info?.[info.length - 1];
                  if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(extType || '')) {
                    extType = 'images';
                  } else if (/woff|woff2|eot|ttf|otf/i.test(extType || '')) {
                    extType = 'fonts';
                  }
                  return `assets/${extType}/[name]-[hash][extname]`;
                },
                chunkFileNames: 'assets/js/[name]-[hash].js',
                entryFileNames: 'assets/js/[name]-[hash].js',
              }
            },
            // Enable minification
            minify: 'terser',
            terserOptions: {
              compress: {
                drop_console: true, // Remove console.log in production
                drop_debugger: true,
              },
            },
            // Optimize source maps for production
            sourcemap: false,
          },
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
