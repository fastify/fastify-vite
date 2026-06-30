/**
 * Server context module for the RSC e2e fixture.
 *
 * The `state()` function seeds the initial Valtio state object that flows
 * through req.route.state → rsc-handler → rsc-entry's ValtioHydrator → client.
 * It returns a plain object — the Valtio proxy() wrapping happens on the
 * client side in the ValtioHydrator component (and in core.jsx for non-RSC routes).
 */

export function state() {
  return {
    count: 42,
    message: 'Hello from Valtio!',
  }
}

/**
 * Default context initializer (required by the runtime).
 */
export default async function init(ctx) {
  // No additional setup needed for this fixture
}
