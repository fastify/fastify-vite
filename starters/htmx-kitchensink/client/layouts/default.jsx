export default function Layout ({ app, req, reply, rid, children }) {
  return (
    <div class="contents">
      {children}
    </div>
  )
}
