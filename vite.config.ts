import {
  defineConfig
} from "vite";
import dts from "vite-plugin-dts";
import {
  resolve as pathResolve
} from 'path'

const resolve = (path: string) => pathResolve(__dirname, path)

export default defineConfig({
  build: {
    minify: false,
    sourcemap: true,
    lib: {
      entry: [
        resolve("src/index.ts"),
        resolve("src/clients/http/NodeHttpClient.ts"),
        resolve("src/clients/http/WebHttpClient.ts"),
      ],
      fileName: (_, entryName) => {
        return `${entryName}.js`;
      },
      formats: ['es'],
    },
    outDir: './dist/esm',
    rollupOptions: {
      external: [
        "async-lock",
        "buffer",
        "clean-git-ref",
        "crc-32",
        "diff3",
        "idb",
        "ignore",
        "pako",
        "sha.js"
      ]
    },
  },
  plugins: [
    dts({
      insertTypesEntry: true,
      outputDir:'./dist/types'
    }),
  ]
});
