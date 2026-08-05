/**
 * The route table.
 *
 * Three facts about it are enforced elsewhere and must stay in agreement with it: `ROUTES` in
 * `lib/routes.ts` declares the same top-level paths, the navigation is derived from that
 * declaration, and `nginx.conf` enumerates them so that an address which is NOT here answers 404
 * rather than 200. `test/routes.test.ts` reads this file as text and fails the build when any of
 * the three has drifted.
 *
 * ── No ProtectedRoute ─────────────────────────────────────────────────────────────────────────
 *
 * Every route here is public and every route here always will be. The web template wraps its pages
 * in a session gate and says in its own comment that the gate is per route rather than per app,
 * "because a marketing page inside a product app must not bounce a reader to sign in". This whole
 * application is that case, so the wrapper was removed on instantiation rather than imported and
 * left unused. A session is still bootstrapped before the first render — that is what puts a
 * returning reader's handle in the shared bar — it just does not gate anything.
 */
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { AppShell } from './components/shell.tsx'
import { AuthProvider } from './lib/auth.tsx'
import { AboutPage } from './pages/about.tsx'
import { BuildPage } from './pages/build.tsx'
import { HomePage } from './pages/home.tsx'
import { LegalPageView } from './pages/legal.tsx'
import { NotFoundPage } from './pages/not-found.tsx'
import { PlatformPage } from './pages/platform.tsx'
import { ProductDetailPage, ProductsIndexPage } from './pages/products.tsx'

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route element={<AppShell />}>
            <Route index element={<HomePage />} />
            {/*
              `products` is the site's one nested route: the index is the grid and `:slug` is one
              product's page, which is why `lib/routes.ts` marks it a wildcard.

              nginx does NOT serve everything under `/products/`. It enumerates the slugs, because
              a prefix there answered 200 for `/products/pay` — the not-found page delivered as a
              success, which is the one thing this repository's configuration exists to prevent.
            */}
            <Route path="products">
              <Route index element={<ProductsIndexPage />} />
              <Route path=":slug" element={<ProductDetailPage />} />
            </Route>
            <Route path="platform" element={<PlatformPage />} />
            <Route path="build" element={<BuildPage />} />
            <Route path="about" element={<AboutPage />} />
            {/*
              One component for both legal pages, selected by the segment, so the two cannot end up
              with different furniture — the notice, the undrafted marker and the section ordering
              are the parts a reader is entitled to see on both.
            */}
            <Route path="terms" element={<LegalPageView />} />
            <Route path="privacy" element={<LegalPageView />} />
            <Route path="risk" element={<LegalPageView />} />
            {/* Unknown addresses render inside the shell, so a reader keeps the navigation they
                need to get back out. The status line is nginx's job and it says 404. */}
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
