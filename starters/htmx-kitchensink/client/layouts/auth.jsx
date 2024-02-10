import { useRouteContext } from '/:core.js'

export default function ({ children }) {
  const { req } = useRouteContext()
  return (
    <div class="contents">
      {!req.session.user
        ? <p>This route needs authentication.</p>
          <button hx-post="/authenticate">
            Click this button to authenticate.
          </button>
        : children
      }
    </div>
  )
}