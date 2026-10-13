(() => {
  const theme = (window.theme = window.theme || {});

  theme.fetchJSON = async (url, options = {}) => {
    const response = await fetch(url, {
      ...options,
      headers: {
        Accept: 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
        ...(options.body && !(options.body instanceof FormData) ? { 'Content-Type': 'application/json' } : {}),
        ...options.headers,
      },
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      const error = new Error(data.description || data.message || theme.strings?.genericError);
      error.status = response.status;
      throw error;
    }
    return data;
  };

  theme.fetchSections = async (sectionIds, url = window.location.pathname) => {
    const target = new URL(url, window.location.origin);
    target.searchParams.set('sections', [].concat(sectionIds).join(','));
    return theme.fetchJSON(target.toString(), { method: 'GET' });
  };

  theme.parseHTML = (html) => new DOMParser().parseFromString(html, 'text/html');

  theme.strings = Object.fromEntries(
    Object.entries(theme.strings || {}).map(([key, value]) => [key, theme.parseHTML(value).documentElement.textContent])
  );

  theme.debounce = (fn, wait = 300) => {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => fn(...args), wait);
    };
  };

  theme.emit = (name, detail = {}) => {
    window.dispatchEvent(new CustomEvent(name, { detail }));
  };
})();
