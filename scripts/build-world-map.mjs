/**
 * Builds src/shared/charts/geo/world.json, the country outlines of the Localisation map.
 *
 * Source: world-atlas (Natural Earth data, public domain), 110m scale, which is plenty
 * for a dashboard-sized map. The script converts the TopoJSON to GeoJSON, replaces the
 * numeric ISO codes with the 2-letter codes our sessions use, drops Antarctica (a lot of
 * empty space, no visitors) and rounds coordinates to keep the file small.
 *
 * Run it again only to change the source data: npm run build:map
 */
import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { createRequire } from 'node:module'
import { feature } from 'topojson-client'
import countries from 'i18n-iso-countries'

const require = createRequire(import.meta.url)
const topology = JSON.parse(
  await readFile(require.resolve('world-atlas/countries-110m.json'), 'utf8'),
)

// Natural Earth's disputed areas carry no ISO code: keep them under a stable key.
const NO_CODE = { Kosovo: 'XK', 'N. Cyprus': 'CY-N', Somaliland: 'SO-S' }

const round = (value) => Math.round(value * 100) / 100
const roundRings = (coords) =>
  typeof coords[0] === 'number' ? coords.map(round) : coords.map(roundRings)

const world = feature(topology, topology.objects.countries)
const features = world.features
  .filter((f) => f.properties.name !== 'Antarctica')
  .map((f) => {
    const code = f.id ? countries.numericToAlpha2(f.id) : NO_CODE[f.properties.name]
    if (!code) throw new Error(`No ISO code for ${f.properties.name} (${f.id})`)
    return {
      type: 'Feature',
      properties: { code },
      geometry: { type: f.geometry.type, coordinates: roundRings(f.geometry.coordinates) },
    }
  })

const target = new URL('../src/shared/charts/geo/world.json', import.meta.url)
await mkdir(new URL('.', target), { recursive: true })
await writeFile(target, JSON.stringify({ type: 'FeatureCollection', features }))
console.log(`world.json: ${features.length} pays`)
