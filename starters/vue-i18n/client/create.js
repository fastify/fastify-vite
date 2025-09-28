import { createApp, createSSRApp, reactive, ref } from 'vue';
import { createRouter } from 'vue-router';
import {
  createHistory,
  serverRouteContext,
  routeLayout,
} from '@fastify/vue/client';
import { createHead as createClientHead } from '@unhead/vue/client';
import { createHead as createServerHead } from '@unhead/vue/server';

import * as root from '$app/root.vue';

function createServerBeforeEachHandler ({ routeMap, ctxHydration }) {
  return function beforeCreate (to) {
    // This navigation guard handles the case when the routes are
    // the same in multiple locales but we are using domains to match
    // which route to use.
    const ctx = routeMap[ctxHydration.req.host + '__' + to.matched[0].path] ?? routeMap['*__' + to.matched[0].path]
    if (ctx && to.name !== ctx.name) {
      return { name: ctx.name, params: to.params, query: to.query }
    }
  }
}

function createClientBeforeEachHandler ({ routeMap, ctxHydration }, layout) {
  return async function beforeCreate (to) {
    // The client-side route context, fallback to unset domain constraint
    const ctx = routeMap[window.location.host + '__' + to.matched[0].path] ?? routeMap['*__' + to.matched[0].path]
    if (to.name !== ctx.name) {
      return { name: ctx.name, params: to.params, query: to.query }
    }

    // Indicates whether or not this is a first render on the client
    ctx.firstRender = ctxHydration.firstRender

    ctx.state = ctxHydration.state
    ctx.actions = ctxHydration.actions

    // Update layoutRef
    layout.value = ctx.layout ?? 'default'

    // If it is, take server context data from hydration and return immediately
    if (ctx.firstRender) {
      ctx.data = ctxHydration.data
      ctx.head = ctxHydration.head
      // Ensure this block doesn't run again during client-side navigation
      ctxHydration.firstRender = false
      to.meta[serverRouteContext] = ctx
      return
    }

    // If we have a getData function registered for this route
    if (ctx.getData) {
      try {
        ctx.data = await jsonDataFetch(to.fullPath, ctx.meta.localePrefix, ctx.meta.locale)
      } catch (error) {
        ctx.error = error
      }
    }
    // Note that ctx.loader() at this point will resolve the
    // memoized module, so there's barely any overhead
    const { getMeta, onEnter } = await ctx.loader()
    if (ctx.getMeta) {
      ctx.head = await getMeta(ctx)
      ctxHydration.useHead.push(ctx.head)
    }
    if (ctx.onEnter) {
      const updatedData = await onEnter(ctx)
      if (updatedData) {
        if (!ctx.data) {
          ctx.data = {}
        }
        Object.assign(ctx.data, updatedData)
      }
    }
    to.meta[serverRouteContext] = ctx
  }
}

export default async function create(ctx) {
  const { routes, ctxHydration } = ctx;

  const instance = ctxHydration.clientOnly
    ? createApp(root.default)
    : createSSRApp(root.default);

  let scrollBehavior = null;
  if (typeof root.scrollBehavior === 'function') {
    scrollBehavior = root.scrollBehavior;
  }

  const history = createHistory();
  const router = createRouter({ history, routes, scrollBehavior });
  const layoutRef = ref(ctxHydration.layout ?? 'default');

  const isServer = import.meta.env.SSR;
  instance.config.globalProperties.$isServer = isServer;

  const head = isServer ? createServerHead() : createClientHead();
  instance.use(head);
  ctxHydration.useHead = head;

  instance.provide(routeLayout, layoutRef);
  if (!isServer && ctxHydration.state) {
    ctxHydration.state = reactive(ctxHydration.state);
  }

  if (isServer) {
    router.beforeEach(createServerBeforeEachHandler(ctx));
    instance.provide(serverRouteContext, ctxHydration);
  } else {
    router.beforeEach(createClientBeforeEachHandler(ctx, layoutRef));
  }

  instance.use(router);

  if (typeof root.configure === 'function') {
    await root.configure({ app: instance, router, head });
  }

  return { instance, ctx, state: ctxHydration.state, router };
}
