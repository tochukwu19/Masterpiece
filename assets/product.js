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

  Alpine.data('productInfo', ({ sectionId, productUrl, updateUrl = true }) => {
    let product;
    let currentUrl = productUrl;
    let controller;

    const selectedOptionValueIds = () =>
      [...product.querySelectorAll('[data-variant-picker] input[data-option-value-id]:checked, [data-variant-picker] select')]
        .map((el) => (el.tagName === 'SELECT' ? el.selectedOptions[0]?.dataset.optionValueId : el.dataset.optionValueId))
        .filter(Boolean);

    const keepingFocus = (render) => {
      const focusedId = document.activeElement?.id;
      render();
      if (focusedId) document.getElementById(focusedId)?.focus({ preventScroll: true });
      window.Shopify?.PaymentButton?.init?.();
    };

    const swapRegions = (incoming) =>
      keepingFocus(() => {
        product.querySelectorAll('[data-product-region]').forEach((region) => {
          const next = incoming.querySelector(`[data-product-region="${region.dataset.productRegion}"]`);
          if (next) region.innerHTML = next.innerHTML;
        });
      });

    const replaceProduct = (incoming) =>
      keepingFocus(() => {
        product.innerHTML = incoming.innerHTML;
      });

    const replaceHistory = (variant) => {
      const next = new URL(currentUrl, window.location.origin);
      if (variant) next.searchParams.set('variant', variant.id);
      window.history.replaceState({}, '', next.toString());
    };

    return {
      loading: false,

      init() {
        product = this.$el;
      },

      async onOptionChange(event) {
        const target = event.target;
        const option = target.tagName === 'SELECT' ? target.selectedOptions[0] : target;
        if (!option?.dataset.optionValueId) return;

        const targetUrl = option.dataset.productUrl || currentUrl;
        const params = new URLSearchParams({ section_id: sectionId, option_values: selectedOptionValueIds().join(',') });

        controller?.abort();
        controller = new AbortController();
        this.loading = true;

        try {
          const response = await fetch(`${targetUrl}?${params}`, { signal: controller.signal });
          const html = theme.parseHTML(await response.text());
          const incoming = html.getElementById(`Product-${sectionId}`);
          if (!incoming) return;

          if (targetUrl !== currentUrl) {
            replaceProduct(incoming);
            currentUrl = targetUrl;
          } else {
            swapRegions(incoming);
          }

          const variant = JSON.parse(incoming.querySelector('script[data-selected-variant]')?.textContent || 'null');
          if (updateUrl) replaceHistory(variant);
          theme.emit('variant-changed', { sectionId, variant });
        } catch (error) {
          if (error.name !== 'AbortError') console.error(error);
        } finally {
          this.loading = false;
        }
      },
    };
  });

  Alpine.data('productGallery', (sectionId) => {
    let gallery;

    const setupXR = () => {
      const models = gallery.querySelector('script[data-product-models]');
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
    };

    return {
      index: 0,

      init() {
        gallery = this.$el;
        setupXR();
      },

      onScroll(list) {
        if (list.scrollWidth <= list.clientWidth) return;
        this.index = Math.round(list.scrollLeft / list.clientWidth);
      },

      showVariantMedia(detail) {
        if (detail?.sectionId !== sectionId) return;
        const mediaId = detail.variant?.featured_media?.id;
        if (!mediaId) return;
        const list = gallery.querySelector('[data-media-list]');
        const item = list?.querySelector(`[data-media-id="${mediaId}"]`);
        if (!item) return;
        const behavior = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';
        if (list.scrollWidth > list.clientWidth) {
          list.scrollTo({ left: item.offsetLeft - list.offsetLeft, behavior });
        } else {
          list.prepend(item);
          const top = gallery.getBoundingClientRect().top;
          if (top < 0) window.scrollBy({ top: top - 96, behavior });
        }
      },

      openLightbox(mediaId) {
        const dialog = document.getElementById(`Lightbox-${sectionId}`);
        if (!dialog) return;
        dialog.showModal();
        dialog.querySelector(`[data-lightbox-media="${mediaId}"]`)?.scrollIntoView({ block: 'start' });
      },
    };
  });

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

  Alpine.data('videoPlayer', () => {
    let player;
    let video;
    let idleTimer;
    let onFullscreenChange;

    return {
      playing: false,
      muted: false,
      current: 0,
      duration: 0,
      fullscreen: false,
      idle: false,

      init() {
        player = this.$el;
        video = player.querySelector('video');
        video.addEventListener('play', () => {
          this.playing = true;
          this.wake();
        });
        video.addEventListener('pause', () => {
          this.playing = false;
          this.idle = false;
        });
        video.addEventListener('ended', () => {
          this.playing = false;
          this.idle = false;
        });
        video.addEventListener('loadedmetadata', () => (this.duration = video.duration || 0));
        video.addEventListener('durationchange', () => (this.duration = video.duration || 0));
        video.addEventListener('timeupdate', () => (this.current = video.currentTime));
        video.addEventListener('volumechange', () => (this.muted = video.muted));
        video.addEventListener('click', () => this.toggle());
        onFullscreenChange = () => (this.fullscreen = document.fullscreenElement === player);
        document.addEventListener('fullscreenchange', onFullscreenChange);
        this.duration = video.duration || 0;
        this.playing = !video.paused;
        this.muted = video.muted;
      },

      destroy() {
        document.removeEventListener('fullscreenchange', onFullscreenChange);
        clearTimeout(idleTimer);
      },

      toggle() {
        video.paused ? video.play() : video.pause();
      },

      seek(value) {
        video.currentTime = Number(value);
      },

      toggleMute() {
        video.muted = !video.muted;
      },

      toggleFullscreen() {
        if (document.fullscreenElement) {
          document.exitFullscreen();
        } else if (player.requestFullscreen) {
          player.requestFullscreen();
        } else if (video.webkitEnterFullscreen) {
          video.webkitEnterFullscreen();
        }
      },

      wake() {
        this.idle = false;
        clearTimeout(idleTimer);
        idleTimer = setTimeout(() => {
          if (this.playing && !player.matches(':focus-within')) this.idle = true;
        }, 2500);
      },

      format(seconds) {
        const total = Math.max(0, Math.floor(seconds || 0));
        return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, '0')}`;
      },
    };
  });

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
    timezoneOffset: new Date().getTimezoneOffset().toString(),
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

  Alpine.data('recommendations', (url, key) => {
    let observer;

    return {
      init() {
        const container = this.$el;
        if (container.querySelector('[data-recommendations-ready]')) return;

        const load = async () => {
          try {
            const html = theme.parseHTML(await (await fetch(url)).text());
            const incoming = html.querySelector(`[data-recommendations="${key}"]`);
            if (incoming && incoming.innerHTML.trim()) {
              container.innerHTML = incoming.innerHTML;
            } else {
              container.hidden = true;
            }
          } catch (error) {
            container.hidden = true;
          } finally {
            container.removeAttribute('data-recommendations-pending');
          }
        };

        observer = new IntersectionObserver(
          ([entry]) => {
            if (!entry.isIntersecting && entry.boundingClientRect.top > 0) return;
            observer.disconnect();
            load();
          },
          { rootMargin: '0px 0px 400px 0px' }
        );
        observer.observe(container);
      },
      destroy() {
        observer?.disconnect();
      },
    };
  });
});
