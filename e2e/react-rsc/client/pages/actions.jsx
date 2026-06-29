export const rsc = true

export default async function ActionsPage() {
  const { increment } = await import('../actions/increment.js')
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
