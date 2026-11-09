<script setup lang="ts">
/**
 * Date range picker in a popover. Built on Reka's RangeCalendar, which brings the
 * hard parts: keyboard navigation (arrows, Page Up/Down, Home/End), range hover
 * preview, disabled dates and screen reader labels.
 *
 * Dates go in and out as "YYYY-MM-DD" strings, the format stored in the URL.
 * The selection is only applied with "Appliquer", so a half-picked range never
 * reloads the dashboard.
 */
import { computed, ref, shallowRef, watch } from 'vue'
import { parseDate, type DateValue } from '@internationalized/date'
import { useMediaQuery } from '@vueuse/core'
import { ChevronLeft, ChevronRight } from '@lucide/vue'
import {
  PopoverContent,
  PopoverPortal,
  PopoverRoot,
  PopoverTrigger,
  RangeCalendarCell,
  RangeCalendarCellTrigger,
  RangeCalendarGrid,
  RangeCalendarGridBody,
  RangeCalendarGridHead,
  RangeCalendarGridRow,
  RangeCalendarHeadCell,
  RangeCalendarHeader,
  RangeCalendarHeading,
  RangeCalendarNext,
  RangeCalendarPrev,
  RangeCalendarRoot,
} from 'reka-ui'

import BaseButton from './BaseButton.vue'

export interface DayRange {
  from: string
  to: string
}

const props = defineProps<{
  /** The range shown when the calendar opens. */
  initial: DayRange
  /** Oldest and newest selectable days. */
  min: string
  max: string
}>()

const emit = defineEmits<{ apply: [range: DayRange] }>()

const open = ref(false)
const isWide = useMediaQuery('(min-width: 640px)')

interface CalendarRange {
  start: DateValue | undefined
  end: DateValue | undefined
}

const draft = shallowRef<CalendarRange>({ start: undefined, end: undefined })

// Each opening starts from the range currently displayed.
watch(open, (isOpen) => {
  if (isOpen) {
    draft.value = { start: parseDate(props.initial.from), end: parseDate(props.initial.to) }
  }
})

const complete = computed(() => Boolean(draft.value.start && draft.value.end))

const summary = computed(() => {
  const { start, end } = draft.value
  if (!start) return 'Choisissez le premier jour'
  if (!end) return 'Choisissez le dernier jour'
  const days = end.compare(start) + 1
  return `${days} jour${days > 1 ? 's' : ''} sélectionné${days > 1 ? 's' : ''}`
})

function onUpdate(value: unknown) {
  draft.value = value as CalendarRange
}

function apply() {
  const { start, end } = draft.value
  if (!start || !end) return
  emit('apply', { from: start.toString(), to: end.toString() })
  open.value = false
}
</script>

<template>
  <PopoverRoot v-model:open="open">
    <PopoverTrigger as-child>
      <slot name="trigger" />
    </PopoverTrigger>

    <PopoverPortal>
      <PopoverContent
        align="end"
        :side-offset="8"
        :collision-padding="12"
        class="z-50 rounded-xl border border-line bg-surface p-4 shadow-pop data-[state=open]:motion-safe:animate-[menu-in_120ms_ease-out]"
      >
        <RangeCalendarRoot
          v-slot="{ grid, weekDays }"
          :model-value="draft"
          :min-value="parseDate(min)"
          :max-value="parseDate(max)"
          :number-of-months="isWide ? 2 : 1"
          :week-starts-on="1"
          locale="fr-FR"
          calendar-label="Période personnalisée"
          fixed-weeks
          initial-focus
          @update:model-value="onUpdate"
        >
          <RangeCalendarHeader class="flex items-center justify-between pb-3">
            <RangeCalendarPrev as-child>
              <BaseButton icon-only variant="ghost" size="sm" aria-label="Mois précédent">
                <ChevronLeft aria-hidden="true" />
              </BaseButton>
            </RangeCalendarPrev>
            <RangeCalendarHeading class="text-[13px] font-medium first-letter:uppercase" />
            <RangeCalendarNext as-child>
              <BaseButton icon-only variant="ghost" size="sm" aria-label="Mois suivant">
                <ChevronRight aria-hidden="true" />
              </BaseButton>
            </RangeCalendarNext>
          </RangeCalendarHeader>

          <div class="flex flex-col gap-6 sm:flex-row">
            <RangeCalendarGrid
              v-for="month in grid"
              :key="month.value.toString()"
              class="border-collapse select-none"
            >
              <RangeCalendarGridHead>
                <RangeCalendarGridRow class="flex">
                  <RangeCalendarHeadCell
                    v-for="day in weekDays"
                    :key="day"
                    class="w-9 pb-1 text-center text-[11px] font-normal text-fg-subtle"
                  >
                    {{ day }}
                  </RangeCalendarHeadCell>
                </RangeCalendarGridRow>
              </RangeCalendarGridHead>
              <RangeCalendarGridBody>
                <RangeCalendarGridRow
                  v-for="(week, index) in month.rows"
                  :key="`week-${index}`"
                  class="flex"
                >
                  <RangeCalendarCell
                    v-for="day in week"
                    :key="day.toString()"
                    :date="day"
                    class="p-0 text-center"
                  >
                    <RangeCalendarCellTrigger
                      :day="day"
                      :month="month.value"
                      class="relative flex size-9 items-center justify-center font-mono text-xs text-fg outline-offset-[-2px] transition-colors hover:bg-surface-muted data-disabled:pointer-events-none data-disabled:text-fg-subtle/40 data-highlighted:bg-accent-soft data-outside-view:invisible data-selected:bg-accent-soft data-selection-end:rounded-r-md data-selection-end:bg-accent data-selection-end:text-canvas data-selection-start:rounded-l-md data-selection-start:bg-accent data-selection-start:text-canvas data-today:font-semibold data-today:underline data-today:decoration-accent data-today:underline-offset-4 [&:not([data-selected])]:rounded-md"
                    />
                  </RangeCalendarCell>
                </RangeCalendarGridRow>
              </RangeCalendarGridBody>
            </RangeCalendarGrid>
          </div>
        </RangeCalendarRoot>

        <div class="mt-4 flex items-center justify-between gap-4 border-t border-line pt-3">
          <p class="text-xs text-fg-muted" aria-live="polite">{{ summary }}</p>
          <div class="flex gap-2">
            <BaseButton size="sm" variant="ghost" @click="open = false">Annuler</BaseButton>
            <BaseButton size="sm" variant="primary" :disabled="!complete" @click="apply">
              Appliquer
            </BaseButton>
          </div>
        </div>
      </PopoverContent>
    </PopoverPortal>
  </PopoverRoot>
</template>
