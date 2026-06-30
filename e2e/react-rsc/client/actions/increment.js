'use server'

export async function increment(prevState, formData) {
  // When called via useActionState: increment(prevState, formData)
  // prevState is the previous { count } value, formData is the form fields.
  // When called via progressive enhancement (no-JS form POST): increment(formData)
  // formData contains the form fields, prevState is undefined.
  const prev = prevState?.count ?? 0
  const fd = formData ?? prevState
  const current = parseInt(fd?.get?.('count') ?? prev, 10)
  return { count: current + 1 }
}
