import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  allowedHosts: [
    "a64332e4-d54a-41ec-bc20-521c356408ca-00-6h29ubt9u3hc.spock.replit.dev",
  ],
  optimizeDeps: {
    exclude: ["lucide-react"],
  },
});
