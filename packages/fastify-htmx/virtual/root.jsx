import layouts from '/:layouts.js'

export default function ({ app, req, reply, children }) {
  const Layout = layouts[req.route?.layout ?? 'default']
  return (
    <Layout app={app} req={req} reply={reply}>
      {children}
    </Layout>
  )
}
