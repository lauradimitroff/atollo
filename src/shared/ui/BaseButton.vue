<script setup lang="ts">
import { computed } from 'vue'
import { LoaderCircle } from '@lucide/vue'

type Variant = 'primary' | 'secondary' | 'ghost'
type Size = 'sm' | 'md'

const props = withDefaults(
  defineProps<{
    variant?: Variant
    size?: Size
    type?: 'button' | 'submit' | 'reset'
    /** Square button holding a single icon. Requires an `aria-label`. */
    iconOnly?: boolean
    loading?: boolean
    disabled?: boolean
  }>(),
  { variant: 'secondary', size: 'md', type: 'button' },
)

const variants: Record<Variant, string> = {
  primary: 'bg-fg text-canvas hover:bg-fg/90',
  secondary: 'border border-line bg-surface text-fg shadow-xs hover:bg-surface-muted',
  ghost: 'text-fg-muted hover:bg-surface-muted hover:text-fg',
}

const sizes: Record<Size, { base: string; icon: string }> = {
  sm: { base: 'h-7 gap-1.5 px-2.5 text-xs', icon: 'size-7' },
  md: { base: 'h-8 gap-2 px-3 text-[13px]', icon: 'size-8' },
}

const classes = computed(() => [
  variants[props.variant],
  props.iconOnly ? sizes[props.size].icon : sizes[props.size].base,
])
</script>

<template>
  <button
    :type="type"
    :disabled="disabled || loading"
    :aria-busy="loading || undefined"
    class="inline-flex shrink-0 items-center justify-center rounded-lg font-medium whitespace-nowrap transition-colors disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0"
    :class="classes"
  >
    <LoaderCircle v-if="loading" class="animate-spin" aria-hidden="true" />
    <slot />
  </button>
</template>
