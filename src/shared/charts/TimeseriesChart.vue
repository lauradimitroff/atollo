<script setup lang="ts">
/**
 * Line chart: current period (signature gradient + area) over the previous period
 * (dashed). Generic: it knows nothing about analytics, the parent provides labels
 * and formatters. ECharts is loaded with the chart chunk only (see echarts.ts).
 */
import './echarts'
import { computed } from 'vue'
import VChart from 'vue-echarts'
import { usePreferredReducedMotion } from '@vueuse/core'
import type { ComposeOption } from 'echarts/core'
import type { LineSeriesOption } from 'echarts/charts'
import type {
  GridComponentOption,
  TooltipComponentOption,
  XAXisComponentOption,
  YAXisComponentOption,
} from 'echarts'

import { useChartTheme, withAlpha } from './useChartTheme'

export interface ChartPoint {
  /** Short x-axis label: "9 nov.", "14 h". */
  axisLabel: string
  /** Full label for the tooltip: "lun. 9 nov.". */
  tooltipLabel: string
  current: number | null
  previous: number
}

const props = defineProps<{
  points: ChartPoint[]
  /** Accessible title, e.g. "Visiteurs uniques par jour". */
  title: string
  currentLabel: string
  previousLabel: string
  formatValue: (value: number) => string
  formatAxis: (value: number) => string
  formatChange: (current: number, previous: number) => string
}>()

/** Option type built from the modules actually registered: typos are caught at compile time. */
type ChartOption = ComposeOption<
  | LineSeriesOption
  | GridComponentOption
  | TooltipComponentOption
  | XAXisComponentOption
  | YAXisComponentOption
>

const tokens = useChartTheme()
const reducedMotion = usePreferredReducedMotion()

const MONO = '"Geist Mono Variable", ui-monospace, monospace'
const SANS = '"Geist Variable", ui-sans-serif, system-ui, sans-serif'

function tooltipHtml(index: number) {
  const point = props.points[index]
  if (!point) return ''
  const t = tokens.value
  const row = (color: string, dashed: boolean, label: string, value: string) =>
    `<div style="display:flex;align-items:center;justify-content:space-between;gap:16px;margin-top:4px">
      <span style="display:flex;align-items:center;gap:8px;color:${t.fgMuted}">
        <i style="width:10px;height:0;border-top:2px ${dashed ? 'dashed' : 'solid'} ${color}"></i>${label}
      </span>
      <b style="font-family:${MONO};font-weight:500;color:${t.fg}">${value}</b>
    </div>`

  const current = point.current
  return `<div style="font-family:${SANS};font-size:12px;min-width:180px">
    <div style="color:${t.fgMuted};margin-bottom:6px">${point.tooltipLabel}</div>
    ${current === null ? '' : row(t.accent, false, props.currentLabel, props.formatValue(current))}
    ${row(t.fgSubtle, true, props.previousLabel, props.formatValue(point.previous))}
    ${
      current === null
        ? ''
        : `<div style="display:flex;justify-content:space-between;margin-top:8px;padding-top:8px;border-top:1px solid ${t.line};color:${t.fgMuted}">
            Évolution<span style="font-family:${MONO}">${props.formatChange(current, point.previous)}</span>
          </div>`
    }
  </div>`
}

const option = computed<ChartOption>(() => {
  const t = tokens.value
  const animate = reducedMotion.value !== 'reduce'

  return {
    animation: animate,
    animationDuration: 500,
    animationDurationUpdate: 400,
    animationEasingUpdate: 'cubicOut',
    // ECharts 6 keeps axis labels inside the chart by default (no more `containLabel`).
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
      data: props.points.map((p) => p.axisLabel),
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
      {
        name: props.previousLabel,
        type: 'line',
        data: props.points.map((p) => p.previous),
        smooth: 0.25,
        symbol: 'none',
        lineStyle: { color: t.fgSubtle, width: 1.5, type: [4, 4] },
        itemStyle: { color: t.fgSubtle },
        emphasis: { disabled: true },
        z: 1,
      },
      {
        name: props.currentLabel,
        type: 'line',
        data: props.points.map((p) => p.current),
        smooth: 0.25,
        showSymbol: false,
        symbolSize: 8,
        lineStyle: {
          width: 2.25,
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 1,
            y2: 0,
            colorStops: [
              { offset: 0, color: t.gradA },
              { offset: 0.5, color: t.gradB },
              { offset: 1, color: t.gradC },
            ],
          },
        },
        itemStyle: { color: t.surface, borderColor: t.accent, borderWidth: 2 },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: withAlpha(t.accent, t.areaOpacity) },
              { offset: 1, color: withAlpha(t.accent, 0) },
            ],
          },
        },
        emphasis: { focus: 'none', scale: true },
        z: 2,
      },
    ],
  }
})
</script>

<template>
  <div>
    <!--
      The height lives on a wrapper: vue-echarts ships its own unlayered CSS
      (height: 100%), which always beats Tailwind's layered utilities.
    -->
    <div class="h-56 sm:h-64">
      <VChart :option="option" autoresize aria-hidden="true" />
    </div>

    <!-- Same data as a table for screen readers (the SVG is hidden from them). -->
    <table class="sr-only">
      <caption>
        {{
          title
        }}
      </caption>
      <thead>
        <tr>
          <th scope="col">Date</th>
          <th scope="col">{{ currentLabel }}</th>
          <th scope="col">{{ previousLabel }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="point in points" :key="point.tooltipLabel">
          <th scope="row">{{ point.tooltipLabel }}</th>
          <td>{{ point.current === null ? '—' : formatValue(point.current) }}</td>
          <td>{{ formatValue(point.previous) }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
