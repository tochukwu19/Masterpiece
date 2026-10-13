document.addEventListener('alpine:init', () => {
  const theme = window.theme;

  Alpine.data('drawer', () => {
    let dialog;
    const open = () => {
      if (!dialog.open) dialog.showModal();
    };
    const close = () => {
      if (dialog.open) dialog.close();
    };

    return {
      init() {
        dialog = this.$el;
      },
      open,
      close,
      toggle(detail) {
        if (detail?.id === dialog.id) open();
      },
    };
  });

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
    press(event) {
      event.pointerType === 'mouse' ? this.show() : this.toggle();
    },
    leave(event) {
      if (!event.currentTarget.contains(event.relatedTarget)) this.hide();
    },
  }));

  Alpine.data('header', (mode) => {
    let onScroll;

    return {
      hidden: false,
      init() {
        if (mode !== 'on-scroll-up') return;
        const header = this.$el;
        let lastY = window.scrollY;
        onScroll = () => {
          const y = window.scrollY;
          if (Math.abs(y - lastY) < 8) return;
          this.hidden = y > lastY && y > header.offsetHeight && !header.querySelector('[aria-expanded="true"]');
          lastY = y;
        };
        window.addEventListener('scroll', onScroll, { passive: true });
      },
      destroy() {
        if (onScroll) window.removeEventListener('scroll', onScroll);
      },
    };
  });

  Alpine.data('predictiveSearch', () => {
    let controller;

    return {
      query: '',
      loading: false,
      hasResults: false,
      status: '',

      async search() {
        const terms = this.query.trim();
        const results = this.$refs.results;
        controller?.abort();
        if (!terms) {
          results.innerHTML = '';
          this.hasResults = false;
          this.status = '';
          return;
        }

        controller = new AbortController();
        this.loading = true;
        const url = new URL(theme.routes.predictive_search_url, window.location.origin);
        url.searchParams.set('q', terms);
        url.searchParams.set('section_id', 'predictive-search');
        url.searchParams.set('resources[limit]', '4');
        url.searchParams.set('resources[limit_scope]', 'each');

        try {
          const response = await fetch(url, { signal: controller.signal });
          const html = await response.text();
          const section = theme.parseHTML(html).querySelector('#shopify-section-predictive-search');
          results.innerHTML = section ? section.innerHTML : '';
          this.status = results.querySelector('[data-status]')?.dataset.status ?? '';
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
    };
  });

  Alpine.data('announcementBar', (count) => ({
    index: 0,
    previous() {
      this.index = (this.index - 1 + count) % count;
    },
    next() {
      this.index = (this.index + 1) % count;
    },
  }));

  Alpine.data('carousel', ({ loop = false, autoplay = 0 } = {}) => {
    let track;
    let observer;
    let timer;
    let held = false;

    const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const direction = () => (getComputedStyle(track).direction === 'rtl' ? -1 : 1);
    const offset = () => Math.abs(track.scrollLeft);
    const pageWidth = () => track.clientWidth;

    const scrollToOffset = (left) => {
      track.scrollTo({ left: left * direction(), behavior: reducedMotion() ? 'auto' : 'smooth' });
    };

    return {
      scrollable: false,
      atStart: true,
      atEnd: false,
      current: 0,
      playing: false,

      get canPrev() {
        return loop || !this.atStart;
      },

      get canNext() {
        return loop || !this.atEnd;
      },

      init() {
        track = this.$el.querySelector('[data-carousel-track]');
        this.sync();
        observer = new ResizeObserver(() => this.sync());
        observer.observe(track);
        if (autoplay > 0 && !reducedMotion()) this.play();
      },

      destroy() {
        observer?.disconnect();
        clearInterval(timer);
      },

      sync() {
        const max = track.scrollWidth - track.clientWidth;
        this.scrollable = max > 1;
        this.atStart = offset() <= 1;
        this.atEnd = offset() >= max - 1;
        this.current = Math.round(offset() / Math.max(pageWidth(), 1));
      },

      prev() {
        if (loop && this.atStart) {
          scrollToOffset(track.scrollWidth);
          return;
        }
        scrollToOffset(Math.max(offset() - pageWidth(), 0));
      },

      next() {
        if (loop && this.atEnd) {
          scrollToOffset(0);
          return;
        }
        scrollToOffset(offset() + pageWidth());
      },

      goTo(index) {
        scrollToOffset(index * pageWidth());
      },

      play() {
        this.playing = true;
        clearInterval(timer);
        timer = setInterval(() => {
          if (!held && !document.hidden) this.next();
        }, autoplay * 1000);
      },

      pause() {
        this.playing = false;
        clearInterval(timer);
      },

      togglePlay() {
        this.playing ? this.pause() : this.play();
      },

      hold(value) {
        held = value;
      },
    };
  });

  Alpine.data('share', ({ url, title }) => ({
    status: '',
    async share() {
      try {
        if (navigator.share) {
          await navigator.share({ url, title });
          return;
        }
        await navigator.clipboard.writeText(url);
        this.status = theme.strings.linkCopied;
        setTimeout(() => (this.status = ''), 3000);
      } catch (error) {
        if (error.name !== 'AbortError') this.status = theme.strings.genericError;
      }
    },
  }));

  Alpine.data('wordmark', () => {
    let observer;

    return {
      init() {
        const container = this.$el;
        const text = container.querySelector('[data-wordmark-text]');
        const fit = () => {
          text.style.fontSize = '100px';
          const natural = text.getBoundingClientRect().width;
          if (natural > 0) text.style.fontSize = `${Math.floor((container.clientWidth / natural) * 10000) / 100}px`;
        };
        fit();
        observer = new ResizeObserver(fit);
        observer.observe(container);
        document.fonts?.ready.then(fit);
      },
      destroy() {
        observer?.disconnect();
      },
    };
  });
});

document.addEventListener('shopify:section:select', (event) => {
  const drawer = event.target.querySelector('dialog.drawer');
  if (drawer && !drawer.open) drawer.showModal();
});

document.addEventListener('shopify:section:deselect', (event) => {
  const drawer = event.target.querySelector('dialog.drawer[open]');
  if (drawer) drawer.close();
});
