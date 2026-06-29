export const rsc = true

// oxlint-disable-next-line no-unused-expressions
;('use server')

export async function increment(formData) {
  const count = parseInt(formData.get('count') || '0', 10)
  return { count: count + 1 }
}

export default async function ActionsPage() {
  return (
    <article>
      <h1>RSC Server Actions</h1>
      <form action={increment}>
        <input type="hidden" name="count" value="0" />
        <button type="submit">Increment</button>
      </form>
    </article>
  )
}
