import { useRoute, useRouter } from 'vue-router';

export function useI18nUtils() {
  const router = useRouter();
  const routes = router.getRoutes();
  const route = useRoute();

  const localePath = (path) => {
    if ('name' in path) {
      const nameWithLocalePrefix = `${route.meta.locale}__${path.name}`;
      for (const route of routes) {
        if (route.name === nameWithLocalePrefix) {
          path.name = nameWithLocalePrefix;
          break;
        }
      }
    }

    return path;
  };

  return {
    localePath,
  };
}
