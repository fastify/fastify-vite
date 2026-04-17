export default [
  {
    path: '/',
    component: () => import('./views/index.vue'),
    triggerFoobarHook: true,
  },
  {
    path: '/other',
    component: () => import('./views/other.vue'),
  },
]
