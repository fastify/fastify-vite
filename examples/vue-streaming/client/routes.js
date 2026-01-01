export default [
  {
    path: '/',
    component: () => import('./views/index.vue'),
  },
  {
    path: '/other',
    component: () => import('./views/other.vue'),
  },
]
