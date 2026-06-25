import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import os from 'os'

// 🔥 récupérer IP locale
function getLocalIP() {
  const interfaces = os.networkInterfaces();

  for (const name in interfaces) {
    for (const net of interfaces[name]) {
      if (
        net.family === 'IPv4' &&
        !net.internal
      ) {
        return net.address;
      }
    }
  }

  return 'localhost';
}

const IP = getLocalIP();

export default defineConfig({
  plugins: [
    react(),
    tailwindcss()
  ],

  server: {
    host: true,
    port: 5173,
  },

  define: {
    __APP_IP__: JSON.stringify(IP),
  }
});