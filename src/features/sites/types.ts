export interface Site {
  /** Also the tracking id put in the snippet installed on the site. */
  id: string
  name: string
  /** Bare domain, without protocol: "atelier-nord.example". */
  domain: string
}

/** What the user types to add or edit a site. */
export type SiteInput = Pick<Site, 'name' | 'domain'>
