export const updateQueryParams = (updates: Record<string, string | null>) => {
  const url = new URL(window.location.href);
  const params = new URLSearchParams(url.search);

  Object.entries(updates).forEach(([key, value]) => {
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
  });

  url.search = params.toString() ? `?${params.toString()}` : "";
  window.history.pushState({}, "", url.toString());
};
