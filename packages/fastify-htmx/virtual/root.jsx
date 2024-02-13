import layouts from '/:layouts.js'

export default function ({ app, rid, req, reply, children }) {
  const Layout = layouts[req.route?.layout ?? 'default']
  return (
    <Layout app={app} rid={rid} req={req} reply={reply}>
      {children}
    </Layout>
  )
}
