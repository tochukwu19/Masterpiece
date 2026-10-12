document.addEventListener('alpine:init', () => {
  const theme = window.theme;

  Alpine.data('facets', (sectionId) => {
    let root;
    let controller;
    let renderedSearch = window.location.search;

    const urlFromForm = (form) => {
      const url = new URL(form.action, window.location.origin);
      const atDefault = new Set(
        [...form.elements].filter((control) => control.dataset.defaultValue === control.value).map((control) => control.name)
      );
      url.search = '';
      for (const [name, value] of new FormData(form)) {
        if (String(value).trim() !== '' && !atDefault.has(name)) url.searchParams.append(name, value);
      }
      return url.toString();
    };

    const swapRegions = (incoming) => {
      const focused = root.contains(document.activeElement) ? document.activeElement : null;
      const drawer = focused?.closest('dialog');
      const typed = focused?.matches('input[type="number"], input[type="text"], input[type="search"]') ? focused.value : null;
      const openGroups = new Map([...root.querySelectorAll('details[id]')].map((group) => [group.id, group.open]));

      root.querySelectorAll('[data-facets-region]').forEach((region) => {
        const next = incoming.querySelector(`[data-facets-region="${region.dataset.facetsRegion}"]`);
        if (next) region.innerHTML = next.innerHTML;
      });

      root.querySelectorAll('details[id]').forEach((group) => {
        if (openGroups.has(group.id)) group.open = openGroups.get(group.id);
      });

      if (!focused) return;
      const restored = focused.id ? document.getElementById(focused.id) : null;
      if (restored) {
        if (typed !== null) restored.value = typed;
        restored.focus({ preventScroll: true });
      } else if (!root.contains(focused)) {
        const fallback = drawer ? drawer.querySelector('.drawer__close') : root.querySelector('[aria-controls^="FacetsDrawer-"]');
        fallback?.focus({ preventScroll: true });
      }
    };

    const announce = () => {
      const status = root.querySelector('[data-facets-status]');
      const count = root.querySelector('[data-facets-region="count"]');
      if (status && count) status.textContent = count.textContent.trim();
    };

    const render = async (url, push = true) => {
      controller?.abort();
      controller = new AbortController();
      const { signal } = controller;
      const target = new URL(url, window.location.origin);
      target.searchParams.set('section_id', sectionId);
      root.setAttribute('aria-busy', 'true');

      try {
        const response = await fetch(target, { signal });
        if (!response.ok) throw new Error(response.statusText);
        swapRegions(theme.parseHTML(await response.text()));
        const next = new URL(url, window.location.origin);
        if (push && next.href !== window.location.href) window.history.pushState({}, '', next);
        renderedSearch = next.search;
        announce();
      } catch (error) {
        if (error.name !== 'AbortError') window.location.assign(url);
      } finally {
        if (!signal.aborted) root.setAttribute('aria-busy', 'false');
      }
    };

    const scheduleRender = theme.debounce((url) => render(url), 250);

    return {
      init() {
        root = this.$el;
      },

      onChange(event) {
        const form = event.target.form;
        if (!form?.hasAttribute('data-facets-form')) return;
        scheduleRender(urlFromForm(form));
      },

      onSubmit(event) {
        const form = event.target;
        if (!form.hasAttribute('data-facets-form')) return;
        event.preventDefault();
        render(urlFromForm(form));
        form.closest('dialog')?.close();
      },

      onClick(event) {
        const link = event.target.closest('a[data-facets-link]');
        if (!link || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
        event.preventDefault();
        render(link.href);
      },

      onPopState() {
        if (window.location.search === renderedSearch) return;
        render(window.location.href, false);
      },
    };
  });
});
