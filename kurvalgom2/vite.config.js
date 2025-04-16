import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    server: {
        port: 61792,
    },
    optimizeDeps: {
        exclude: ['crypto', 'absurd-sql'],
    },
    build: {
        commonjsOptions: {
            transformMixedEsModules: true,
        },
    },
    define: {
        'process.env.NODE_DEBUG': JSON.stringify(''),
        // Provide polyfills if needed
        global: 'window',
    },
    // Handle modules that need to be externalized
    resolve: {
        alias: {
            // No need for direct alias, using window.absurdSQL instead
        },
    },
});