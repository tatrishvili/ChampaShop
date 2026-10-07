export function useDebouncedQuery(
  key: string,
  delayMs = 300,
  clearKeys: string[] = [],
) {
  const route = useRoute();
  const router = useRouter();
  const localValue = ref(String(route.query[key] ?? ""));
  let timer: ReturnType<typeof setTimeout>;
  // True while we are mirroring an external URL change into localValue, so the
  // writer watcher below skips it and does not push back to the router.
  let syncingFromRoute = false;

  // Keep the input in sync when the query changes from outside (browser back /
  // forward, a cleared filter, a shared link). Without this the field would keep
  // showing a stale value while the list already reflects the new URL.
  watch(
    () => route.query[key],
    (value) => {
      const next = String(value ?? "");
      if (next !== localValue.value) {
        syncingFromRoute = true;
        localValue.value = next;
      }
    },
  );

  watch(localValue, (value) => {
    if (syncingFromRoute) {
      syncingFromRoute = false;
      return;
    }
    clearTimeout(timer);
    timer = setTimeout(() => {
      // clearKeys: query params to drop when this value changes (e.g. search <->
      // category exclusivity). page is always reset.
      const cleared = Object.fromEntries(clearKeys.map((k) => [k, undefined]));
      router.push({
        query: {
          ...route.query,
          ...cleared,
          [key]: value || undefined,
          page: undefined,
        },
      });
    }, delayMs);
  });

  return localValue;
}
