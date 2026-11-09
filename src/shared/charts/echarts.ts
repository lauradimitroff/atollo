/**
 * ECharts, imported piece by piece.
 * `import * as echarts from 'echarts'` weighs ~1 MB; registering only the line chart,
 * the components we use and the SVG renderer keeps the chart chunk several times smaller.
 * SVG rather than canvas: crisp at any zoom, and our datasets are small (≤ 365 points).
 */
import { use } from 'echarts/core'
import { LineChart } from 'echarts/charts'
import { GridComponent, TooltipComponent } from 'echarts/components'
import { SVGRenderer } from 'echarts/renderers'

use([LineChart, GridComponent, TooltipComponent, SVGRenderer])
