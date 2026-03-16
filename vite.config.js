import { resolve } from "path";
import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        index: resolve(__dirname, "index.html"),
        newProperty: resolve(__dirname, "new-property.html"),
        login: resolve(__dirname, "login.html"),
      },
    },
  },
  plugins: [tailwindcss()],
});
