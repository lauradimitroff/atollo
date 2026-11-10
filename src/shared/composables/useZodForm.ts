import { computed, nextTick, ref, watch, type Ref } from 'vue'
import type { z } from 'zod'

type FieldErrors<T> = Partial<Record<keyof T, string>>

export interface UseZodFormOptions {
  /** Turns a failed submission into a message for the whole form. */
  errorMessage: (error: unknown) => string
}

/**
 * Small form helper around a zod schema:
 * - validates on submit, then live while the user fixes the fields (not before:
 *   red messages while typing a first time feel like being scolded);
 * - one error per field, the first one zod reports;
 * - moves focus to the first invalid field, so keyboard and screen reader users
 *   land where the problem is;
 * - tracks the submission (loading state, error of the whole form, success message
 *   until the next edit) and whether anything changed since the last save.
 */
export function useZodForm<S extends z.ZodObject>(
  schema: S,
  initial: z.input<S>,
  { errorMessage }: UseZodFormOptions,
) {
  const baseline = ref({ ...initial }) as Ref<z.input<S>>
  const values = ref({ ...initial }) as Ref<z.input<S>>
  const errors = ref<FieldErrors<z.input<S>>>({})
  const formError = ref<string | null>(null)
  const submitting = ref(false)
  const attempted = ref(false)
  const succeeded = ref(false)
  const dirty = computed(() => JSON.stringify(values.value) !== JSON.stringify(baseline.value))

  function validate(): z.output<S> | null {
    const result = schema.safeParse(values.value)
    if (result.success) {
      errors.value = {}
      return result.data
    }
    const next: FieldErrors<z.input<S>> = {}
    for (const issue of result.error.issues) {
      const field = issue.path[0] as keyof z.input<S>
      next[field] ??= issue.message
    }
    errors.value = next
    return null
  }

  // Synchronous: an edit clears the success message at once, and `reset()` inside an
  // action runs before the success is recorded.
  watch(
    values,
    () => {
      succeeded.value = false
      if (attempted.value) validate()
    },
    { deep: true, flush: 'sync' },
  )

  /** Back to a clean form, e.g. after saving: new values become the reference. */
  function reset(next: z.input<S> = baseline.value) {
    attempted.value = false
    baseline.value = { ...next }
    values.value = { ...next }
    errors.value = {}
    formError.value = null
  }

  function handleSubmit(action: (data: z.output<S>) => Promise<unknown>) {
    return async (event?: Event) => {
      const form = event?.currentTarget instanceof HTMLFormElement ? event.currentTarget : null
      attempted.value = true
      formError.value = null
      succeeded.value = false
      const data = validate()
      if (!data) {
        await nextTick()
        form?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus()
        return
      }
      submitting.value = true
      try {
        await action(data)
        succeeded.value = true
      } catch (error) {
        formError.value = errorMessage(error)
      } finally {
        submitting.value = false
      }
    }
  }

  return { values, errors, formError, submitting, succeeded, dirty, reset, handleSubmit }
}
