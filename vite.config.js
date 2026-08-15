import { cp, mkdir } from "node:fs/promises";
import { resolve } from "node:path";
import { defineConfig } from "vite";

const rootDirectory = import.meta.dirname;

/** @returns {import("vite").Plugin} */
function copyExtensionFiles() {
  return {
    name: "copy-extension-files",
    async closeBundle() {
      const outputDirectory = resolve(rootDirectory, "dist");
      await mkdir(outputDirectory, { recursive: true });
      await Promise.all([
        cp(
          resolve(rootDirectory, "manifest.json"),
          resolve(outputDirectory, "manifest.json"),
        ),
        cp(resolve(rootDirectory, "icons"), resolve(outputDirectory, "icons"), {
          recursive: true,
        }),
      ]);
    },
  };
}

export default defineConfig({
  plugins: [copyExtensionFiles()],
  build: {
    emptyOutDir: true,
    rollupOptions: {
      input: {
        background: resolve(rootDirectory, "src/background.js"),
        options: resolve(rootDirectory, "src/options/index.html"),
      },
      output: {
        entryFileNames: "src/[name].js",
        chunkFileNames: "src/[name].js",
        assetFileNames: "src/options/[name][extname]",
      },
    },
  },
});
