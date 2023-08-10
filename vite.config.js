import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueJsx(),           
  ],
  build: {
    outDir: 'dir', // Dossier de sortie pour les fichiers générés
    assetsDir: 'assets', // Dossier pour les actifs tels que les fichiers CSS et JS
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      'vue': 'vue/dist/vue.esm-bundler.js',
    }
  }  
})


