import { defineConfig } from "vite";
export default defineConfig({
  build: {
    outDir: "demo-dist",
    target: "es2022",
    rollupOptions: {
      output: {
        manualChunks: (id) =>
          /node_modules\/(react|react-dom|scheduler)\//.test(id)
            ? "react"
            : undefined,
      },
    },
  },
});
