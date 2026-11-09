/**
 * Raw analytics events. Every statistic (visitors, bounce rate, top pages…)
 * is computed from these, never stored precomputed.
 *
 * Mirrors the future `sessions` / `pageviews` tables (see the data model in the
 * project plan), with pageviews nested in their session for convenience.
 */

export type Channel = 'direct' | 'organic' | 'social' | 'referral' | 'campaign' | 'email'
export type Device = 'desktop' | 'mobile' | 'tablet'

export interface Utm {
  source: string
  medium: string
  campaign: string
}

export interface Pageview {
  path: string
  /** Epoch milliseconds. */
  viewedAt: number
  /** Unknown (null) for the last page of a session: nothing tells when the visitor left. */
  timeOnPageS: number | null
}

export interface Session {
  id: string
  /** Anonymous, stable id: the same person coming back keeps it. */
  visitorId: string
  /** Epoch milliseconds (numbers are lighter than Date objects for 100k+ sessions). */
  startedAt: number
  /** Sum of the known times on page; 0 for a bounce. */
  durationS: number
  channel: Channel
  /** Referring domain ("google.com"), null for direct traffic. */
  referrer: string | null
  utm: Utm | null
  /** ISO 3166-1 alpha-2 code: "FR". */
  country: string
  city: string
  device: Device
  browser: string
  os: string
  /** At least one; the first is the entry page, the last the exit page. */
  pageviews: Pageview[]
}
