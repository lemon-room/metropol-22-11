import { URL, fileURLToPath } from 'node:url'
import glsl from 'vite-plugin-glsl'
import { defineConfig } from "vite"


export default defineConfig({
  server: {
    watch: {
      usePolling: true
    }
  },
  plugins: [glsl({
    include: [                   // Glob pattern, or array of glob patterns to import
      '**/*.glsl', '**/*.wgsl',
      '**/*.vert', '**/*.frag',
      '**/*.vs', '**/*.fs'
    ],
    exclude: undefined,          // Glob pattern, or array of glob patterns to ignore
    warnDuplicatedImports: true, // Warn if the same chunk was imported multiple times
    defaultExtension: 'glsl',    // Shader suffix when no extension is specified
    compress: false,             // Compress output shader code
    watch: true,                 // Recompile shader on change
    root: '/'                    // Directory for root imports
  })],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@shaders': fileURLToPath(new URL('./src/shaders', import.meta.url)),
      '@components': fileURLToPath(
        new URL('./src/components', import.meta.url)
      ),
    },
  },
})