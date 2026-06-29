export default function AuthLayout({ children }) {
  // In a real app, the Fastify preHandler would authenticate
  // and the auth state would flow through the render context.
  // This layout wraps authenticated routes.
  return (
    <div className="auth-layout">
      <nav>
        <p>Authenticated area</p>
      </nav>
      <main>{children}</main>
    </div>
  )
}
