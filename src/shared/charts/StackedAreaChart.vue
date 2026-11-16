<script setup lang="ts">
/**
 * Stacked areas: how a total splits between series over time (e.g. visits per
 * channel). Generic like TimeseriesChart: labels, colors and formatting come from
 * the parent. The colors are indexes into the categorical palette of the theme.
 */
import './echarts'
import { computed } from 'vue'
import VChart from 'vue-echarts'
import { usePreferredReducedMotion } from '@vueuse/core'
import type { ComposeOption } from 'echarts/core'
import type { LineSeriesOption } from 'echarts/charts'
import type {
  GridComponentOption,
  MarkAreaComponentOption,
  TooltipComponentOption,
  XAXisComponentOption,
  YAXisComponentOption,
} from 'echarts'

import { useChartTheme, withAlpha } from './useChartTheme'

export interface StackedSeries {
  name: string
  /** Index in the categorical palette (0 → 5). */
  colorIndex: number
  /** One value per category; null where there is no data yet (future). */
  values: (number | null)[]
}

const props = defineProps<{
  categories: { axisLabel: string; tooltipLabel: string }[]
  /** Bottom of the stack first. */
  series: StackedSeries[]
  title: string
  formatValue: (value: number) => string
  formatAxis: (value: number) => string
  /**
   * The last category with data is still in progress (this hour, day…): its low total
   * would look like a sudden drop, so it is veiled and labelled "en cours".
   */
  lastIsPartial?: boolean
}>()

/** Index of the in-progress category, or -1. */
const partialIndex = computed(() => {
  if (!props.lastIsPartial) return -1
  for (let i = props.categories.length - 1; i >= 0; i--) {
    if (props.series.some((s) => s.values[i] !== null && s.values[i] !== undefined)) return i
  }
  return -1
})

type ChartOption = ComposeOption<
  | LineSeriesOption
  | GridComponentOption
  | MarkAreaComponentOption
  | TooltipComponentOption
  | XAXisComponentOption
  | YAXisComponentOption
>

const tokens = useChartTheme()
const reducedMotion = usePreferredReducedMotion()
const MONO = '"Geist Mono Variable", ui-monospace, monospace'
const SANS = '"Geist Variable", ui-sans-serif, system-ui, sans-serif'

const color = (index: number) => tokens.value.categorical[index] ?? tokens.value.accent

function tooltipHtml(index: number) {
  const t = tokens.value
  const category = props.categories[index]
  if (!category) return ''
  const rows = props.series.map((s) => ({ s, value: s.values[index] ?? 0 })).reverse() // same order as the stack, top first
  const total = rows.reduce((sum, r) => sum + r.value, 0)
  return `<div style="font-family:${SANS};font-size:12px;min-width:200px">
    <div style="color:${t.fgMuted};margin-bottom:6px">${category.tooltipLabel}${
      index === partialIndex.value ? ' · en cours' : ''
    }</div>
    ${rows
      .map(
        ({
          s,
          value,
        }) => `<div style="display:flex;justify-content:space-between;gap:16px;margin-top:3px">
          <span style="display:flex;align-items:center;gap:8px;color:${t.fgMuted}">
            <i style="width:8px;height:8px;border-radius:2px;background:${color(s.colorIndex)}"></i>${s.name}
          </span>
          <span style="font-family:${MONO};color:${t.fg}">${props.formatValue(value)}</span>
        </div>`,
      )
      .join('')}
    <div style="display:flex;justify-content:space-between;margin-top:8px;padding-top:8px;border-top:1px solid ${t.line};color:${t.fgMuted}">
      Total<b style="font-family:${MONO};font-weight:500;color:${t.fg}">${props.formatValue(total)}</b>
    </div>
  </div>`
}

/**
 * The in-progress segment, veiled: a flat, unstacked area drawn above the stack,
 * as high as the largest total. (A mark area would be drawn under the areas.)
 */
function veil(): LineSeriesOption[] {
  const index = partialIndex.value
  if (index <= 0) return []
  const t = tokens.value
  const totals = props.categories.map((_, i) =>
    props.series.reduce((sum, s) => sum + (s.values[i] ?? 0), 0),
  )
  const top = Math.max(...totals)
  const area: [{ xAxis: number }, { xAxis: number }] = [{ xAxis: index - 1 }, { xAxis: index }]
  return [
    {
      type: 'line',
      data: totals.map((_, i) => (i >= index - 1 && i <= index ? top : null)),
      z: 10,
      silent: true,
      showSymbol: false,
      lineStyle: { opacity: 0 },
      areaStyle: { color: withAlpha(t.surface, 0.6) },
      tooltip: { show: false },
      // Only for its label: the veil itself is the area above.
      markArea: {
        silent: true,
        itemStyle: { color: 'transparent' },
        label: {
          show: true,
          position: 'insideTop',
          color: t.fgMuted,
          fontFamily: SANS,
          fontSize: 11,
          formatter: 'en cours',
        },
        data: [area],
      },
    },
  ]
}

const option = computed<ChartOption>(() => {
  const t = tokens.value
  return {
    animation: reducedMotion.value !== 'reduce',
    animationDurationUpdate: 400,
    grid: { left: 4, right: 28, top: 16, bottom: 4 },
    tooltip: {
      trigger: 'axis',
      backgroundColor: t.surface,
      borderColor: t.lineStrong,
      borderWidth: 1,
      padding: [10, 12],
      extraCssText: 'border-radius:8px;box-shadow:0 12px 32px -12px rgba(0,0,0,.25);',
      axisPointer: { type: 'line', lineStyle: { color: t.lineStrong, width: 1 } },
      formatter: (params) => {
        const first = Array.isArray(params) ? params[0] : params
        return tooltipHtml(first?.dataIndex ?? 0)
      },
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: props.categories.map((c) => c.axisLabel),
      axisLine: { lineStyle: { color: t.line } },
      axisTick: { show: false },
      axisLabel: {
        color: t.fgSubtle,
        fontFamily: MONO,
        fontSize: 11,
        margin: 12,
        hideOverlap: true,
      },
    },
    yAxis: {
      type: 'value',
      splitNumber: 4,
      axisLabel: { color: t.fgSubtle, fontFamily: MONO, fontSize: 11, formatter: props.formatAxis },
      splitLine: { lineStyle: { color: t.line, type: [3, 4] } },
    },
    series: [
      ...props.series.map((s): LineSeriesOption => ({
        name: s.name,
        type: 'line',
        stack: 'total',
        data: s.values,
        smooth: 0.25,
        showSymbol: false,
        lineStyle: { width: 1.25, color: color(s.colorIndex) },
        itemStyle: { color: color(s.colorIndex) },
        areaStyle: { color: withAlpha(color(s.colorIndex), 0.55) },
        emphasis: { focus: 'series' },
      })),
      ...veil(),
    ],
  }
})
</script>

<template>
  <div>
    <!-- Height on a wrapper: vue-echarts' own CSS would override a class on VChart. -->
    <div class="h-64 sm:h-72">
      <VChart :option="option" autoresize aria-hidden="true" />
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
            <th scope="col">Date</th>
            <th v-for="s in series" :key="s.name" scope="col">{{ s.name }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(category, i) in categories" :key="category.tooltipLabel">
            <th scope="row">{{ category.tooltipLabel }}</th>
            <td v-for="s in series" :key="s.name">
              {{ s.values[i] === null ? '—' : formatValue(s.values[i]!) }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
