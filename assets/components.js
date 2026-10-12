document.addEventListener('alpine:init', () => {
  const theme = window.theme;

  Alpine.data('drawer', () => ({
    open() {
      if (!this.$root.open) this.$root.showModal();
    },
    close() {
      if (this.$root.open) this.$root.close();
    },
    toggle(detail) {
      if (detail?.id === this.$root.id) this.open();
    },
  }));

  Alpine.data('disclosure', () => ({
    expanded: false,
    show() {
      this.expanded = true;
    },
    hide(returnFocus = false) {
      if (!this.expanded) return;
      this.expanded = false;
      if (returnFocus) this.$refs.trigger?.focus();
    },
    toggle() {
      this.expanded ? this.hide() : this.show();
    },
    leave(event) {
      if (!this.$root.contains(event.relatedTarget)) this.hide();
    },
  }));

  Alpine.data('header', (mode) => ({
    hidden: false,
    lastY: 0,
    init() {
      if (mode !== 'on-scroll-up') return;
      this.onScroll = () => {
        const y = window.scrollY;
        const threshold = this.$root.offsetHeight;
        if (Math.abs(y - this.lastY) < 8) return;
        this.hidden = y > this.lastY && y > threshold && !this.$root.querySelector('[aria-expanded="true"]');
        this.lastY = y;
      };
      window.addEventListener('scroll', this.onScroll, { passive: true });
    },
    destroy() {
      if (this.onScroll) window.removeEventListener('scroll', this.onScroll);
    },
  }));

  Alpine.data('predictiveSearch', () => ({
    query: '',
    loading: false,
    hasResults: false,
    status: '',
    controller: null,

    async search() {
      const terms = this.query.trim();
      this.controller?.abort();
      if (!terms) {
        this.$refs.results.innerHTML = '';
        this.hasResults = false;
        this.status = '';
        return;
      }

      this.controller = new AbortController();
      this.loading = true;
      const url = new URL(theme.routes.predictive_search_url, window.location.origin);
      url.searchParams.set('q', terms);
      url.searchParams.set('section_id', 'predictive-search');
      url.searchParams.set('resources[limit]', '4');
      url.searchParams.set('resources[limit_scope]', 'each');

      try {
        const response = await fetch(url, { signal: this.controller.signal });
        const html = await response.text();
        const section = theme.parseHTML(html).querySelector('#shopify-section-predictive-search');
        this.$refs.results.innerHTML = section ? section.innerHTML : '';
        const summary = this.$refs.results.querySelector('[data-status]');
        this.status = summary?.dataset.status ?? '';
        this.hasResults = Boolean(section);
      } catch (error) {
        if (error.name !== 'AbortError') this.status = theme.strings.genericError;
      } finally {
        this.loading = false;
      }
    },

    clear() {
      this.query = '';
      this.search();
      this.$refs.input.focus();
    },
  }));

  Alpine.data('announcementBar', (count) => ({
    index: 0,
    previous() {
      this.index = (this.index - 1 + count) % count;
    },
    next() {
      this.index = (this.index + 1) % count;
    },
  }));

  Alpine.data('wordmark', () => ({
    init() {
      this.fit();
      this.observer = new ResizeObserver(() => this.fit());
      this.observer.observe(this.$root);
      document.fonts?.ready.then(() => this.fit());
    },
    destroy() {
      this.observer?.disconnect();
    },
    fit() {
      const text = this.$refs.text;
      text.style.fontSize = '100px';
      const available = this.$root.clientWidth;
      const natural = text.getBoundingClientRect().width;
      if (natural > 0) text.style.fontSize = `${Math.floor((available / natural) * 10000) / 100}px`;
    },
  }));
});

document.addEventListener('shopify:section:select', (event) => {
  const drawer = event.target.querySelector('dialog.drawer');
  if (drawer && !drawer.open) drawer.showModal();
});

document.addEventListener('shopify:section:deselect', (event) => {
  const drawer = event.target.querySelector('dialog.drawer[open]');
  if (drawer) drawer.close();
});
