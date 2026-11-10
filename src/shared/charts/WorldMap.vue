<script setup lang="ts">
/**
 * Choropleth world map: each country is shaded by its value (visits). Generic like
 * the other charts: names, formatting and what a click does come from the parent.
 *
 * The outlines (src/shared/charts/geo/world.json, Natural Earth, public domain) ship in
 * this component's chunk, so they are only downloaded when a map is displayed.
 */
import { use, registerMap, type ComposeOption } from 'echarts/core'
import { MapChart, type MapSeriesOption } from 'echarts/charts'
import { TooltipComponent, type TooltipComponentOption } from 'echarts/components'
import { SVGRenderer } from 'echarts/renderers'
import { computed } from 'vue'
import VChart from 'vue-echarts'
import { usePreferredReducedMotion } from '@vueuse/core'

import world from './geo/world.json'
import { choroplethColor } from './colorScale'
import { useChartTheme } from './useChartTheme'

use([MapChart, TooltipComponent, SVGRenderer])
// The file is typed loosely by the JSON import; it is a valid GeoJSON FeatureCollection.
registerMap('world', world as unknown as Parameters<typeof registerMap>[1])

export interface MapValue {
  /** ISO 3166-1 alpha-2 code, as in the sessions: "FR". */
  code: string
  value: number
}

export type MapView = 'europe' | 'world'

const props = defineProps<{
  values: readonly MapValue[]
  /** Countries drawn with an outline (active filters). */
  selected: readonly string[]
  view: MapView
  /** Accessible table caption. */
  title: string
  countryName: (code: string) => string
  formatValue: (value: number) => string
}>()

const emit = defineEmits<{ select: [code: string] }>()

type ChartOption = ComposeOption<MapSeriesOption | TooltipComponentOption>

const tokens = useChartTheme()
const reducedMotion = usePreferredReducedMotion()
const MONO = '"Geist Mono Variable", ui-monospace, monospace'
const SANS = '"Geist Variable", ui-sans-serif, system-ui, sans-serif'

// [[west, north], [east, south]]: what each view frames.
const BOUNDS: Record<MapView, [[number, number], [number, number]]> = {
  europe: [
    [-12, 71],
    [34, 34],
  ],
  world: [
    [-170, 84],
    [190, -58],
  ],
}

const byCode = computed(() => new Map(props.values.map((v) => [v.code, v.value])))
const max = computed(() => Math.max(0, ...props.values.map((v) => v.value)))

function tooltipHtml(code: string) {
  const t = tokens.value
  const value = byCode.value.get(code)
  return `<div style="font-family:${SANS};font-size:12px;min-width:150px">
    <div style="color:${t.fg};font-weight:500">${props.countryName(code)}</div>
    <div style="margin-top:4px;color:${t.fgMuted}">${
      value
        ? `<span style="font-family:${MONO};color:${t.fg}">${props.formatValue(value)}</span> visites`
        : 'Aucune visite'
    }</div>
  </div>`
}

const option = computed<ChartOption>(() => {
  const t = tokens.value
  const selected = new Set(props.selected)
  return {
    animation: reducedMotion.value !== 'reduce',
    tooltip: {
      trigger: 'item',
      backgroundColor: t.surface,
      borderColor: t.lineStrong,
      borderWidth: 1,
      padding: [8, 10],
      extraCssText: 'border-radius:8px;box-shadow:0 12px 32px -12px rgba(0,0,0,.25);',
      formatter: (params) => tooltipHtml(Array.isArray(params) ? '' : (params.name ?? '')),
    },
    series: [
      {
        type: 'map',
        map: 'world',
        nameProperty: 'code',
        boundingCoords: BOUNDS[props.view],
        selectedMode: false,
        itemStyle: { areaColor: t.surfaceMuted, borderColor: t.surface, borderWidth: 0.6 },
        emphasis: {
          label: { show: false },
          itemStyle: { areaColor: t.lineStrong, borderColor: t.fg, borderWidth: 1 },
        },
        label: { show: false },
        data: props.values.map((v) => ({
          name: v.code,
          value: v.value,
          itemStyle: {
            areaColor: choroplethColor(v.value, max.value, t.surfaceMuted, t.accent),
            ...(selected.has(v.code) && { borderColor: t.fg, borderWidth: 1.5 }),
          },
          emphasis: {
            itemStyle: {
              areaColor: choroplethColor(v.value, max.value, t.surfaceMuted, t.accent),
              borderColor: t.fg,
              borderWidth: 1.5,
            },
          },
        })),
      },
    ],
  }
})

function onClick(params: { name?: string }) {
  if (params.name && byCode.value.has(params.name)) emit('select', params.name)
}
</script>

<template>
  <div>
    <!-- Height on a wrapper: vue-echarts' own CSS would override a class on VChart. -->
    <div class="h-72 sm:h-96">
      <VChart :option="option" autoresize aria-hidden="true" @click="onClick" />
    </div>

    <!-- The legend reads the same scale as the map: from 1 visit to the maximum. -->
    <div
      v-if="max > 0"
      class="mt-2 flex items-center justify-end gap-2 px-3 font-mono text-[11px] text-fg-subtle"
      aria-hidden="true"
    >
      <span>1</span>
      <span
        class="h-1.5 w-28 rounded-full"
        :style="{
          background: `linear-gradient(to right, ${choroplethColor(1, max, tokens.surfaceMuted, tokens.accent)}, ${tokens.accent})`,
        }"
      />
      <span>{{ formatValue(max) }} visites</span>
    </div>

    <!-- sr-only on a wrapper: a <table> ignores the 1px width and would widen the page. -->
    <div class="sr-only">
      <table>
        <caption>
          {{
            title
          }}
        </caption>
        <thead>
          <tr>
            <th scope="col">Pays</th>
            <th scope="col">Visites</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="v in values" :key="v.code">
            <th scope="row">{{ countryName(v.code) }}</th>
            <td>{{ formatValue(v.value) }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
