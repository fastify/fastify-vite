export default function ({ req, children }) {
  console.log('children', children)
  return (
    <div class="contents">
      {children}
    </div>
  )
}