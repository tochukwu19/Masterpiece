document.addEventListener('alpine:init', () => {
  const theme = window.theme;
  const modelViewerStylesheet = '//cdn.shopify.com/shopifycloud/model-viewer-ui/assets/v1.0/model-viewer-ui.css';

  const loadStylesheet = (href) => {
    if (document.querySelector(`link[href="${href}"]`)) return;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    document.head.appendChild(link);
  };

  Alpine.data('productInfo', ({ sectionId, productUrl, updateUrl = true }) => ({
    url: productUrl,
    loading: false,
    controller: null,

    selectedOptionValueIds() {
      return [...this.$root.querySelectorAll('[data-variant-picker] input[data-option-value-id]:checked, [data-variant-picker] select')]
        .map((el) => (el.tagName === 'SELECT' ? el.selectedOptions[0]?.dataset.optionValueId : el.dataset.optionValueId))
        .filter(Boolean);
    },

    async onOptionChange(event) {
      const target = event.target;
      const option = target.tagName === 'SELECT' ? target.selectedOptions[0] : target;
      if (!option?.dataset.optionValueId) return;

      const targetUrl = option.dataset.productUrl || this.url;
      const params = new URLSearchParams({ section_id: sectionId, option_values: this.selectedOptionValueIds().join(',') });

      this.controller?.abort();
      this.controller = new AbortController();
      this.loading = true;

      try {
        const response = await fetch(`${targetUrl}?${params}`, { signal: this.controller.signal });
        const html = theme.parseHTML(await response.text());
        const incoming = html.getElementById(`Product-${sectionId}`);
        if (!incoming) return;

        if (targetUrl !== this.url) {
          this.replaceProduct(incoming, targetUrl);
        } else {
          this.swapRegions(incoming);
        }

        const variant = JSON.parse(incoming.querySelector('script[data-selected-variant]')?.textContent || 'null');
        if (updateUrl) this.updateUrl(variant);
        theme.emit('variant-changed', { sectionId, variant });
      } catch (error) {
        if (error.name !== 'AbortError') console.error(error);
      } finally {
        this.loading = false;
      }
    },

    swapRegions(incoming) {
      const focusedId = document.activeElement?.id;
      this.$root.querySelectorAll('[data-product-region]').forEach((region) => {
        const next = incoming.querySelector(`[data-product-region="${region.dataset.productRegion}"]`);
        if (next) region.innerHTML = next.innerHTML;
      });
      if (focusedId) document.getElementById(focusedId)?.focus({ preventScroll: true });
      window.Shopify?.PaymentButton?.init?.();
    },

    replaceProduct(incoming, targetUrl) {
      const focusedId = document.activeElement?.id;
      this.$root.innerHTML = incoming.innerHTML;
      this.url = targetUrl;
      if (focusedId) document.getElementById(focusedId)?.focus({ preventScroll: true });
      window.Shopify?.PaymentButton?.init?.();
    },

    updateUrl(variant) {
      const next = new URL(this.url, window.location.origin);
      if (variant) next.searchParams.set('variant', variant.id);
      window.history.replaceState({}, '', next.toString());
    },
  }));

  Alpine.data('productGallery', (sectionId) => ({
    index: 0,

    init() {
      this.setupXR();
    },

    onScroll() {
      const list = this.$refs.list;
      if (list.scrollWidth <= list.clientWidth) return;
      this.index = Math.round(list.scrollLeft / list.clientWidth);
    },

    showVariantMedia(detail) {
      if (detail?.sectionId !== sectionId) return;
      const mediaId = detail.variant?.featured_media?.id;
      if (!mediaId) return;
      const item = this.$refs.list.querySelector(`[data-media-id="${mediaId}"]`);
      if (!item) return;
      const list = this.$refs.list;
      const behavior = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';
      if (list.scrollWidth > list.clientWidth) {
        list.scrollTo({ left: item.offsetLeft - list.offsetLeft, behavior });
      } else {
        list.prepend(item);
        const top = this.$root.getBoundingClientRect().top;
        if (top < 0) window.scrollBy({ top: top - 96, behavior });
      }
    },

    openLightbox(mediaId) {
      const dialog = document.getElementById(`Lightbox-${sectionId}`);
      if (!dialog) return;
      dialog.showModal();
      dialog.querySelector(`[data-lightbox-media="${mediaId}"]`)?.scrollIntoView({ block: 'start' });
    },

    setupXR() {
      const models = this.$root.querySelector('script[data-product-models]');
      if (!models || !window.Shopify?.loadFeatures) return;
      const setup = () => {
        if (!window.ShopifyXR) {
          document.addEventListener('shopify_xr_initialized', setup, { once: true });
          return;
        }
        window.ShopifyXR.addModels(JSON.parse(models.textContent));
        window.ShopifyXR.setupXRElements();
      };
      window.Shopify.loadFeatures([{ name: 'shopify-xr', version: '1.0', onLoad: setup }]);
    },
  }));

  Alpine.data('deferredMedia', () => ({
    loaded: false,

    load() {
      if (this.loaded) return;
      document.querySelectorAll('[data-deferred-media] video').forEach((video) => video.pause());
      document.querySelectorAll('[data-deferred-media] iframe').forEach((frame) => {
        frame.contentWindow?.postMessage('{"event":"command","func":"pauseVideo","args":""}', '*');
        frame.contentWindow?.postMessage('{"method":"pause"}', '*');
      });

      this.$refs.target.appendChild(this.$refs.template.content.cloneNode(true));
      this.loaded = true;

      const model = this.$refs.target.querySelector('model-viewer');
      if (model && window.Shopify?.loadFeatures) {
        loadStylesheet(modelViewerStylesheet);
        window.Shopify.loadFeatures([
          {
            name: 'model-viewer-ui',
            version: '1.0',
            onLoad: (errors) => {
              if (errors) return;
              const ui = new window.Shopify.ModelViewerUI(model);
              ui.play();
            },
          },
        ]);
      }

      this.$nextTick(() => this.$refs.target.querySelector('video, iframe, model-viewer')?.focus());
    },
  }));

  Alpine.data('quantityInput', () => ({
    step(direction) {
      const input = this.$refs.input;
      const before = input.value;
      direction > 0 ? input.stepUp() : input.stepDown();
      if (input.value !== before) input.dispatchEvent(new Event('change', { bubbles: true }));
    },
  }));

  Alpine.data('giftCardRecipient', () => ({
    enabled: false,
    init() {
      if (this.$refs.offset) this.$refs.offset.value = new Date().getTimezoneOffset().toString();
    },
  }));

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

  Alpine.data('recommendations', (url, key) => ({
    init() {
      if (this.$root.querySelector('[data-recommendations-ready]')) return;
      this.observer = new IntersectionObserver(
        ([entry]) => {
          if (!entry.isIntersecting && entry.boundingClientRect.top > 0) return;
          this.observer.disconnect();
          this.load();
        },
        { rootMargin: '0px 0px 400px 0px' }
      );
      this.observer.observe(this.$root);
    },
    destroy() {
      this.observer?.disconnect();
    },
    async load() {
      try {
        const html = theme.parseHTML(await (await fetch(url)).text());
        const incoming = html.querySelector(`[data-recommendations="${key}"]`);
        if (incoming && incoming.innerHTML.trim()) {
          this.$root.innerHTML = incoming.innerHTML;
        } else {
          this.$root.hidden = true;
        }
      } catch (error) {
        this.$root.hidden = true;
      } finally {
        this.$root.removeAttribute('data-recommendations-pending');
      }
    },
  }));
});
