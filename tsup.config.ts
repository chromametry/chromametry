import { defineConfig } from 'tsup';


export default defineConfig({
  entry: ['src/index.ts'],
  format: ["cjs", "esm", "iife"],
  globalName: "Chromametry",
  dts: true,
  minify: true, 
  sourcemap: false,
  clean: true
});