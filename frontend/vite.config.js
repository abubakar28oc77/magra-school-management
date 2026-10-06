import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteSingleFile } from 'vite-plugin-singlefile';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function copyToRootPlugin() {
  return {
    name: 'copy-to-root-plugin',
    closeBundle() {
      const distIndex = path.resolve(__dirname, 'dist', 'index.html');
      const rootIndex = path.resolve(__dirname, '..', 'index.html');
      const rootMagra = path.resolve(__dirname, '..', 'magra_school_management.html');
      if (fs.existsSync(distIndex)) {
        const content = fs.readFileSync(distIndex);
        fs.writeFileSync(rootIndex, content);
        fs.writeFileSync(rootMagra, content);
        console.log('[Auto-Sync] Copied singlefile bundle to root index.html and magra_school_management.html');
      }
    }
  };
}

export default defineConfig({
  plugins: [react(), viteSingleFile(), copyToRootPlugin()],
  build: {
    target: 'esnext',
    assetsInlineLimit: 100000000,
    chunkSizeWarningLimit: 100000000,
    cssCodeSplit: false
  }
});
