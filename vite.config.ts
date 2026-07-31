import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

/**
 * There is deliberately no `define`, no `envPrefix` and no `.env` file in this repository.
 *
 * A build-time constant is an environment baked into an image, and an image with an environment
 * baked into it has to be rebuilt to be promoted — which means the artefact that reaches
 * production is not the artefact that passed CI. Every host this app talks to is resolved at
 * RUNTIME from `window.location.hostname` by `cloudsforgeHosts()`, so one image serves localhost,
 * staging, a preview deployment and production. `test/no-build-time-config.test.ts` fails the
 * build if `import.meta.env.VITE_` ever reappears.
 */
export default defineConfig({
  plugins: [react()],
  resolve: {
    // @cloudsforge/ui is a `link:` dependency, so its own node_modules holds a second copy of React.
    // Two copies means two dispatchers, and the shared bar would throw on its first useState.
    dedupe: ['react', 'react-dom'],
  },
  optimizeDeps: {
    // The linked package is shipped as TypeScript source until it is published; pre-bundling it
    // would freeze a stale copy of a package that is edited in the same working tree.
    exclude: ['@cloudsforge/ui'],
  },
  build: {
    // Named chunks and a real manifest of hashes: the assets are immutable-cached by nginx, and
    // that is only safe when every rebuild produces a new filename.
    sourcemap: true,
  },
  /*
   * 5170, not the template's 5180.
   *
   * The marketing site's whole job is sending people to other surfaces, so the thing you do while
   * developing it is run it NEXT TO one of them — most often Forge Hub, which took the template's
   * port unchanged. Two Vite servers on one port is a five-minute confusion where the second one
   * silently picks 5181 and every link you click lands on the first.
   *
   * This is a developer convenience and nothing more. It is not the port the site is served on in
   * production, and nothing in the bundle knows about it: the registry's own dev port for `site`
   * is 3000, and `cloudsforgeHosts()` resolves that at runtime like every other surface.
   */
  server: { port: 5170 },
  preview: { port: 5170 },
})
