/**
 * Review renders of this surface's chrome, at a desktop and a phone width.
 *
 *     CF_CHROME=… node --import tsx test/journeys/shots.ts       # → /tmp/cf-shots
 *
 * ── WHY THE SCRIPT IS COMMITTED AND THE IMAGES ARE NOT ────────────────────────────────────────
 *
 * `micro-brand` settled this question already, and its `.gitignore` states the position in one
 * line: "Contact sheets are built from the assets on demand and are not artefacts." Its whole
 * `review/` tree is ignored, with a single exception for the file recording a HUMAN JUDGEMENT made
 * by looking at the sheets — because that is the part a rebuild cannot reproduce.
 *
 * The same reasoning applies here, and it is the reason this file exists rather than a folder of
 * PNGs. A screenshot pasted into an issue is evidence of what the page looked like on the machine
 * that took it, on a date, from a tree nobody can identify afterwards. A command anybody can run
 * against the current checkout is evidence of what the page looks like NOW. So the judgements go
 * in the pull request and the issue in words, and this reproduces the pictures they were made
 * from.
 *
 * ── TWO THINGS IT DOES THAT ARE NOT OBVIOUS ───────────────────────────────────────────────────
 *
 * The footer and the grids are captured with `fullPage: true` and a `clip`, NOT with
 * `locator.screenshot()`. The site header is sticky, so an element shot of the footer scrolls it
 * into view and then composites the header bar over the top of it — which looks exactly like a
 * layout defect and is not one. A full-page capture lays a sticky element out at its document
 * position, so the clip is what the region actually contains.
 *
 * The clip spans the FIRST card grid through the LAST one on purpose. micro-org#488 put a second
 * grid on these pages, and the defect worth seeing is a difference BETWEEN the two — the first cut
 * used `auto-fit`, which collapses empty tracks, so the three-card grid rendered wider cards than
 * the six-card grid above it and read as a different component. Either grid photographed alone
 * looks perfectly fine.
 */
import { mkdirSync } from 'node:fs'
import { startSurface, stopSurface } from './surface.ts'
import { browser, closeBrowser } from './browser.ts'

const OUT = process.env['CF_SHOTS_DIR'] ?? '/tmp/cf-shots'

/** Both ends of the range the stylesheet has breakpoints for. Retina, because the type is thin. */
const VIEWPORTS = [
  { name: 'desktop', width: 1440, height: 960, scale: 2 },
  { name: 'mobile', width: 390, height: 844, scale: 3 },
] as const

/** The pages whose chrome changed. Both carry the footer; both carry two card grids. */
const PAGES = [
  ['/', 'home'],
  ['/products', 'products'],
] as const

interface Box {
  x: number
  y: number
  width: number
  height: number
}

async function main(): Promise<void> {
  mkdirSync(OUT, { recursive: true })
  const surface = await startSurface()
  const engine = await browser()

  for (const viewport of VIEWPORTS) {
    const context = await engine.newContext({
      viewport: { width: viewport.width, height: viewport.height },
      deviceScaleFactor: viewport.scale,
      // The light scheme is the one that was broken: this surface sets no `data-cf-scheme`, so
      // `--cf-ember` fell through to the dark ramp and the footer wordmark rendered at 2.62:1.
      colorScheme: 'light',
    })
    const page = await context.newPage()

    for (const [route, label] of PAGES) {
      await page.goto(`${surface.origin}${route}`, { waitUntil: 'networkidle' })
      await page.evaluate('window.scrollTo(0, 0)')
      await page.waitForTimeout(300)

      const footer = await page.locator('footer').first().boundingBox()
      if (footer) await clip(page, `${label}-footer-${viewport.name}`, footer)

      const grids = page.locator('.si-cards')
      const count = await grids.count()
      if (count > 1) {
        const first = await grids.nth(0).boundingBox()
        const last = await grids.nth(count - 1).boundingBox()
        // Back up above the first grid so its section heading is in the frame, and past the last
        // so the bottom row is not cropped.
        if (first && last) {
          await clip(page, `${label}-grids-${viewport.name}`, {
            x: Math.max(0, first.x - 24),
            y: Math.max(0, first.y - 96),
            width: first.width + 48,
            height: last.y + last.height - first.y + 120,
          })
        }
      }

      await page.screenshot({ path: `${OUT}/${label}-full-${viewport.name}.png`, fullPage: true })
      console.log(`${label} ${viewport.name}`)
    }
    await context.close()
  }

  await closeBrowser()
  await stopSurface()
  console.log(`\n${OUT}`)
}

async function clip(
  page: Awaited<ReturnType<Awaited<ReturnType<typeof browser>>['newPage']>>,
  name: string,
  box: Box,
): Promise<void> {
  await page.screenshot({ path: `${OUT}/${name}.png`, fullPage: true, clip: box })
}

await main()
