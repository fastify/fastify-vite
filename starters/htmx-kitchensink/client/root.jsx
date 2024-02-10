import Layout from '/:layout.jsx'

export default function () {
  return (
    <Layout>
      <component
        :is="Component"
        :key="$route.path"
      />
    </Layout>
  )
}