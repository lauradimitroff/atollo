import { nextTick, ref, watch, type Ref } from 'vue'
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
 * - tracks the submission (loading state, error of the whole form).
 */
export function useZodForm<S extends z.ZodObject>(
  schema: S,
  initial: z.input<S>,
  { errorMessage }: UseZodFormOptions,
) {
  const values = ref({ ...initial }) as Ref<z.input<S>>
  const errors = ref<FieldErrors<z.input<S>>>({})
  const formError = ref<string | null>(null)
  const submitting = ref(false)
  const attempted = ref(false)

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

  watch(values, () => attempted.value && validate(), { deep: true })

  function handleSubmit(action: (data: z.output<S>) => Promise<unknown>) {
    return async (event?: Event) => {
      const form = event?.currentTarget instanceof HTMLFormElement ? event.currentTarget : null
      attempted.value = true
      formError.value = null
      const data = validate()
      if (!data) {
        await nextTick()
        form?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus()
        return
      }
      submitting.value = true
      try {
        await action(data)
      } catch (error) {
        formError.value = errorMessage(error)
      } finally {
        submitting.value = false
      }
    }
  }

  return { values, errors, formError, submitting, handleSubmit }
}
