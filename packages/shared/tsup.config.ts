import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  tsconfig: './tsconfig.json',
  esbuildOptions(options) {
    options.resolveExtensions = ['.ts', '.js', '.json'];
    return options;
  },
}); 