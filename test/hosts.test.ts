/**
 * Host resolution: the mechanism that lets ONE image serve every environment.
 *
 * If these assertions ever have to be relaxed, a build-time constant has crept back in.
 */
import assert from 'node:assert/strict'
import { afterEach, describe, it } from 'node:test'
import type { CloudsForgeHosts } from '@cloudsforge/ui'
import { environment, hosts, isTestnet, liveUrl, resolveApiBase } from '../src/lib/hosts.ts'
import { installWindow, removeWindow } from './browser-stubs.ts'

afterEach(removeWindow)

describe('hosts()', () => {
  it('resolves to the local dev ports when served from localhost', () => {
    // ── `status` RATHER THAN `trade`, AND THAT IS A CHOICE ──────────────────────────────────────
    //
    // What this asserts is that the DEV PORT is read from the registry, on a surface whose address
    // is just origin + port. `trade` became `<apex>/trade` in wave 3b, so its entry is
    // `http://localhost:4006/trade` and the assertion would be about the mount rather than the
    // port. `status` stays on its own hostname permanently — the plan keeps seven groups there —
    // so this will not move again. The MOUNTED spelling is asserted two lines down.
    installWindow('http://localhost:5180/')
    const resolved = hosts()
    assert.equal(resolved.status, 'http://localhost:3013')
    assert.equal(resolved.trade, 'http://localhost:4006/trade')
    assert.equal(resolved.nimbus, 'http://localhost:4001')
    assert.equal(resolved.lantern, 'http://localhost:4010')
  })

  it('derives the apex from a product subdomain', () => {
    // The subdomain being STRIPPED has to be one the registry still knows, or nothing is derived
    // and the whole name becomes the apex — which is what `trade.<apex>` does since wave 3b, and
    // correctly: nothing is served there any more. `status` is the durable choice.
    installWindow('https://status.cloudsforge.online/settings')
    const resolved = hosts()
    assert.equal(resolved.status, 'https://status.cloudsforge.online')
    // And the consolidated surface resolves to the apex plus its mount, from the same page.
    assert.equal(resolved.trade, 'https://cloudsforge.online/trade')
    assert.equal(resolved.nimbus, 'https://nimbus.cloudsforge.online')
    assert.equal(resolved.account, 'https://account.cloudsforge.online')
    // The marketing site is the apex itself, with no subdomain.
    assert.equal(resolved.site, 'https://cloudsforge.online')
  })

  it('treats an unrecognised prefix as its own apex', () => {
    // A preview deployment is not a CloudsForge subdomain. Stripping `pr-42` would send the
    // sign-in redirect to a host that does not exist, and the user would never come back.
    installWindow('https://pr-42.example.dev/')
    assert.equal(hosts().nimbus, 'https://nimbus.pr-42.example.dev')
  })

  it('resolves a surface that is a path on another surface', () => {
    installWindow('https://hub.cloudsforge.online/')
    assert.equal(hosts().wallet, 'https://hub.cloudsforge.online/wallet')
  })
})

/**
 * WHICH ESTATE IS THIS, AND WHERE IS THE OTHER ONE.
 *
 * Both apexes serve this same bundle — measured 2026-08-07, `https://cloudsforge.online/` and
 * `https://testnet.cloudsforge.online/` returned the same asset — so the only thing that can tell
 * a reader they are looking at a rehearsal is code that reads the hostname at runtime. These cases
 * are the whole of that code, and the failure they guard is SILENT in both directions: a banner
 * that never appears looks exactly like a page that does not need one, and a banner that appears
 * on the live estate is this site calling its own production network a rehearsal.
 */
describe('environment()', () => {
  it('is unlabelled on the live estate, on the apex and on a product subdomain', () => {
    installWindow('https://cloudsforge.online/')
    assert.equal(environment(), '')
    assert.equal(isTestnet(), false)
    removeWindow()

    installWindow('https://trade.cloudsforge.online/settings')
    assert.equal(environment(), '')
    assert.equal(isTestnet(), false)
  })

  it('reads the environment out of the first label, which is where it lives', () => {
    // The bare apex form: the site surface has no subdomain to suffix, so the label stands alone.
    installWindow('https://testnet.cloudsforge.online/build')
    assert.equal(environment(), 'testnet')
    assert.equal(isTestnet(), true)
    removeWindow()

    // …and the suffixed form every other surface uses. This site is never served here, but the
    // helper is the estate's rule rather than this page's, and a rule that only works on one
    // hostname shape is the rule that broke when testnet moved from a prefix to a suffix.
    installWindow('https://hub-testnet.cloudsforge.online/')
    assert.equal(environment(), 'testnet')
  })

  it('is unlabelled in local development, where there is no other estate to be sent to', () => {
    installWindow('http://localhost:5180/')
    assert.equal(environment(), '')
    assert.equal(isTestnet(), false)
  })

  it('reads no environment out of a hostname that merely contains a hyphen', () => {
    // A preview deployment is not an environment of this estate. `pr-42` splits into `pr` and
    // `42`, neither of which is a registry subdomain or an environment label, and a banner here
    // would tell a reviewer their own deployment is the test network.
    installWindow('https://pr-42.example.dev/')
    assert.equal(environment(), '')
  })
})

describe('liveUrl()', () => {
  it('takes the environment label off this surface, so the way out is composed and never typed', () => {
    installWindow('https://testnet.cloudsforge.online/')
    // The registry resolves `site` to the estate the reader is ON…
    assert.equal(hosts().site, 'https://testnet.cloudsforge.online')
    // …and this is the same surface on the estate that is not a rehearsal. Nothing in `src` may
    // spell that address, which is exactly why it is derived here.
    assert.equal(liveUrl('site'), 'https://cloudsforge.online')
  })

  it('takes it off a suffixed subdomain too, and keeps a surface that is a path on another', () => {
    installWindow('https://testnet.cloudsforge.online/')
    assert.equal(liveUrl('hub'), 'https://hub.cloudsforge.online')
    // The wallet is a path inside Hub. Dropping the path would send a reader to Hub's front door
    // and call it the wallet.
    assert.equal(hosts().wallet, 'https://hub-testnet.cloudsforge.online/wallet')
    assert.equal(liveUrl('wallet'), 'https://hub.cloudsforge.online/wallet')
  })

  it('changes nothing on an estate that carries no environment label', () => {
    installWindow('https://cloudsforge.online/')
    assert.equal(liveUrl('site'), 'https://cloudsforge.online')
    assert.equal(liveUrl('hub'), 'https://hub.cloudsforge.online')
    removeWindow()

    // Including localhost: there is one dev estate, and the live twin of it is itself.
    installWindow('http://localhost:5180/')
    assert.equal(liveUrl('site'), hosts().site)
    assert.equal(liveUrl('trade'), 'http://localhost:4006/trade')
  })
})

describe('resolveApiBase()', () => {
  // Only the two keys under test: the function reads one entry and never enumerates the record.
  const local = {
    trade: 'http://localhost:4006',
    hub: 'https://hub.x.dev/wallet',
  } as unknown as CloudsForgeHosts

  it('is relative when the page and the API share an origin', () => {
    assert.equal(resolveApiBase('http://localhost:4006', local, 'trade'), '')
  })

  it('is absolute when they do not — the dev server on another port', () => {
    assert.equal(resolveApiBase('http://localhost:5180', local, 'trade'), 'http://localhost:4006')
  })

  it('compares origins, not whole URLs, so a surface with a base path is still same-origin', () => {
    assert.equal(resolveApiBase('https://hub.x.dev', local, 'hub'), '')
  })

  it('is absolute when there is no page origin to be relative to', () => {
    assert.equal(resolveApiBase('', local, 'trade'), 'http://localhost:4006')
  })
})
