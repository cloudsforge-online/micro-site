/**
 * Every address this site publishes as public is fetched, over the real internet, and must answer.
 *
 * ══════════════════════════════════════════════════════════════════════════════════════════════
 * THIS TEST USES THE NETWORK AND DOES NOT SKIP WHEN IT IS UNAVAILABLE.
 *
 * The same rule as `./estate-claims.test.ts` and `./estate-stages.test.ts`, for the same reason: a
 * check that turns itself off when its inputs are missing produces the same green tick as one that
 * ran. There is no `SKIP_NETWORK` escape hatch here and adding one would delete the test.
 * ══════════════════════════════════════════════════════════════════════════════════════════════
 *
 * ── Why the static check is not enough ────────────────────────────────────────────────────────
 *
 * `./estate-stages.test.ts` already requires the hostname derived for every entry in `PUBLIC_SURFACES` to appear in
 * estate's own Cloudflare Tunnel configuration. That proves the address was MEANT to exist. It
 * cannot prove it does, and on the day this file was written the estate contained two live
 * counter-examples, both configured in exactly the same way as the working ones:
 *
 *   the estate's `worlds-api` name   configured in the tunnel, NO DNS RECORD AT ALL — nothing
 *                                    resolves and the connection is never attempted.
 *   the estate's `api` name          configured, resolving, and answering 502 from the edge,
 *                                    because nothing healthy sits behind that name.
 *
 * A reader cannot tell those apart from a working surface by reading a configuration file, and
 * neither can a test that only reads one. So this fetches.
 *
 * ── And why the testnet names make this mandatory rather than nice to have ────────────────────
 *
 * Cloudflare's Universal SSL certificate covers a SINGLE-LABEL wildcard under the apex: it matches
 * the testnet apex itself and it does not match a surface underneath it. A two-label wildcard needs
 * Advanced Certificate Manager, which is paid and is not bought, so every testnet subdomain
 * resolves to Cloudflare and then fails the TLS handshake before a byte of HTTP is exchanged.
 *
 * That failure is invisible to DNS, invisible to the tunnel configuration, and invisible to any
 * check that does not complete a TLS session. Publishing one of those addresses would put a link
 * on a public marketing site that cannot be opened by anyone, ever, and nothing but a real fetch
 * would have caught it.
 *
 * ── What this asserts, and what it deliberately does not ──────────────────────────────────────
 *
 * Asserted: the name resolves, the TLS handshake completes against the PUBLIC trust store, and the
 * surface answers 200. The trust store matters and is why `fetch` is used with no agent and no
 * `NODE_TLS_REJECT_UNAUTHORIZED` — the estate's internal gateway has its own certificate
 * authority, and a check that accepted it would pass against a surface no stranger's browser could
 * open. That is the exact failure this file exists to prevent, so the certificate must be one the
 * public already trusts.
 *
 * NOT asserted: that the page is correct, that sign-in works, that the surface is finished, or that
 * anything on it is worth money. Reachability is the whole claim `open` makes — see the meaning in
 * `src/content/stages.ts` — and it is the whole claim checked here.
 */
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, it } from 'node:test'
import { PUBLIC_SURFACES } from '../src/content/stages.ts'
import { apexOf, hostFor, tunnelHostnames } from './estate-stages.test.ts'

/** Generous: this crosses the real internet, and a slow answer is still an answer. */
const TIMEOUT_MS = 20_000
/**
 * Three attempts, because a transient blip is not a false claim.
 *
 * This is the one concession to flakiness and it is bounded deliberately. Retrying does not make a
 * dead address pass — an address with no DNS record fails three times as fast as it fails once —
 * it only stops a single dropped packet from reporting the site as dishonest. A test that cried
 * wolf on every network hiccup would be switched off within a week, and a switched-off test is the
 * defect this estate keeps finding.
 */
const ATTEMPTS = 3

export interface Probe {
  readonly status: number | null
  readonly error: string | null
}

/** Fetch once. Never throws: a transport failure is a result, not an exception. */
export async function probeOnce(url: string, fetchImpl = fetch): Promise<Probe> {
  const control = new AbortController()
  const timer = setTimeout(() => control.abort(), TIMEOUT_MS)
  try {
    const response = await fetchImpl(url, {
      signal: control.signal,
      redirect: 'follow',
      headers: { 'user-agent': 'cloudsforge-site-claim-check' },
    })
    return { status: response.status, error: null }
  } catch (error) {
    // A DNS failure, a refused connection and a rejected certificate all land here, and the
    // message is the only thing that distinguishes them. It is reported verbatim.
    return { status: null, error: (error as Error).message }
  } finally {
    clearTimeout(timer)
  }
}

/** Fetch with retries, returning the LAST result. Pure enough for the self-test below to drive. */
export async function probe(url: string, fetchImpl = fetch, attempts = ATTEMPTS): Promise<Probe> {
  let last: Probe = { status: null, error: 'never attempted' }
  for (let i = 0; i < attempts; i += 1) {
    last = await probeOnce(url, fetchImpl)
    if (last.status === 200) return last
  }
  return last
}

/* ─────────────────────────────── the prober's own test ─────────────────────────────── */

describe('the prober itself', () => {
  /*
   * Proving this file can fail WITHOUT taking the estate down to do it.
   *
   * Every assertion below drives `probe` with a stub, because the alternative — trusting that a
   * network check works because it happens to be green — is precisely the "check that cannot fail"
   * this estate has now found eight times. The real fetches follow; these prove the machinery
   * reports what it sees rather than reporting success.
   */
  it('reports a non-200 rather than treating any answer as an answer', async () => {
    const stub = async (): Promise<Response> => new Response('bad gateway', { status: 502 })
    assert.deepEqual(await probe('https://example.invalid/', stub, 2), { status: 502, error: null })
  })

  it('reports a transport failure as a failure and not as a skip', async () => {
    // The shape of a rejected certificate or an absent DNS record.
    const stub = async (): Promise<Response> => {
      throw new Error('getaddrinfo ENOTFOUND')
    }
    const result = await probe('https://example.invalid/', stub, 2)
    assert.equal(result.status, null)
    assert.match(result.error ?? '', /ENOTFOUND/)
  })

  it('retries, and a later success counts', async () => {
    let calls = 0
    const stub = async (): Promise<Response> => {
      calls += 1
      if (calls < 2) throw new Error('transient')
      return new Response('ok', { status: 200 })
    }
    assert.deepEqual(await probe('https://example.invalid/', stub, 3), { status: 200, error: null })
    assert.equal(calls, 2, 'it kept going after succeeding')
  })

  it('gives up rather than retrying for ever, and reports the last failure', async () => {
    let calls = 0
    const stub = async (): Promise<Response> => {
      calls += 1
      throw new Error('still down')
    }
    const result = await probe('https://example.invalid/', stub, 3)
    assert.equal(calls, 3)
    assert.match(result.error ?? '', /still down/)
  })
})

/* ─────────────────────────────── against the real internet ─────────────────────────────── */

const TUNNEL = fileURLToPath(new URL('../../deploy/cloudflared/config.mainnet.public.yml', import.meta.url))
const APEX = apexOf(tunnelHostnames(readFileSync(TUNNEL, 'utf8')))

describe('every address this site publishes as open', () => {
  it('has at least one, so this is not an empty loop reporting success', () => {
    // The failure mode of every table-driven check: the table empties and the suite stays green.
    assert.ok(
      PUBLIC_SURFACES.length >= 5,
      `PUBLIC_SURFACES declares ${PUBLIC_SURFACES.length} surfaces`,
    )
  })

  for (const key of PUBLIC_SURFACES) {
    const host = hostFor(key, APEX)
    it(`answers on the public internet: ${host}`, async () => {
      const result = await probe(`https://${host}/`)
      assert.equal(
        result.status,
        200,
        result.error !== null
          ? `${key} publishes ${host}, which could not be reached at all: ${result.error}. ` +
              'Either the surface is down, the DNS record is missing, or the certificate is not ' +
              'one the public trusts — and until it is fixed this site is telling readers to open ' +
              'an address that does not work. If the surface is deliberately no longer public, ' +
              'remove it from PUBLIC_AT and its page drops to "Running in-house" on its own.'
          : `${key} publishes ${host}, which answered ${result.status} rather than 200.`,
      )
    })
  }
})
