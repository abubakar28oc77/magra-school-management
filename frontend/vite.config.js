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
        const safeWrite = (p, label) => {
          for (let attempt = 0; attempt < 5; attempt++) {
            try {
              fs.writeFileSync(p, content);
              console.log(`[Auto-Sync] Copied singlefile bundle to ${label}`);
              break;
            } catch (err) {
              if (attempt === 4) console.warn(`[Auto-Sync] Warning: could not write to ${label}:`, err.message);
              // Small sync wait
              const start = Date.now();
              while (Date.now() - start < 100) {}
            }
          }
        };
        safeWrite(rootIndex, 'root index.html');
        safeWrite(rootMagra, 'magra_school_management.html');
        const desktopMagra = 'C:\\Users\\Walton\\OneDrive\\Desktop\\Magra_School_Management.html';
        if (fs.existsSync(desktopMagra)) {
          safeWrite(desktopMagra, 'Desktop Magra_School_Management.html');
        }
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
