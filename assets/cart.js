(() => {
  const theme = window.theme;

  theme.cartSectionIds = () => [...new Set([...document.querySelectorAll('[data-cart-section]')].map((el) => el.dataset.cartSection))];

  theme.renderCartSections = (sections) => {
    if (!sections) return;
    const focusedId = document.activeElement?.id;
    Object.entries(sections).forEach(([id, html]) => {
      if (!html) return;
      const incoming = theme.parseHTML(html).querySelector(`[data-cart-section="${id}"]`);
      if (!incoming) return;
      document.querySelectorAll(`[data-cart-section="${id}"]`).forEach((target) => {
        target.innerHTML = incoming.innerHTML;
      });
    });
    if (focusedId) document.getElementById(focusedId)?.focus();
  };

  theme.refreshCart = async () => {
    theme.renderCartSections(await theme.fetchSections(theme.cartSectionIds()));
  };

  theme.openCart = () => {
    if (theme.settings.cartType === 'drawer' && document.getElementById('CartDrawer')) {
      theme.emit('drawer-open', { id: 'CartDrawer' });
    } else {
      window.location.href = theme.routes.cart_url;
    }
  };

  window.addEventListener('added-to-cart', async () => {
    if (theme.settings.cartType !== 'drawer') {
      window.location.href = theme.routes.cart_url;
      return;
    }
    await theme.refreshCart();
    theme.openCart();
  });

  document.addEventListener('alpine:init', () => {
    Alpine.data('quickAdd', () => ({
      loading: false,
      error: '',

      async submit(event) {
        if (theme.settings.cartType !== 'drawer') return;
        event.preventDefault();

        this.loading = true;
        this.error = '';
        const body = new FormData(event.target);
        body.append('sections', theme.cartSectionIds().join(','));
        body.append('sections_url', window.location.pathname);

        try {
          const response = await theme.fetchJSON(`${theme.routes.cart_add_url}.js`, { method: 'POST', body });
          theme.renderCartSections(response.sections);
          theme.emit('cart-updated', { source: 'quick-add' });
          theme.openCart();
        } catch (error) {
          this.error = error.message || theme.strings.genericError;
        } finally {
          this.loading = false;
        }
      },
    }));

    Alpine.data('cart', () => ({
      loading: false,
      errors: {},

      async update(line, quantity) {
        const value = Math.max(0, parseInt(quantity, 10) || 0);
        this.loading = true;
        this.errors = {};
        try {
          const cart = await theme.fetchJSON(`${theme.routes.cart_change_url}.js`, {
            method: 'POST',
            body: JSON.stringify({
              line,
              quantity: value,
              sections: theme.cartSectionIds(),
              sections_url: window.location.pathname,
            }),
          });
          theme.renderCartSections(cart.sections);
          theme.emit('cart-updated', { cart });
          if (value === 0) this.announce(theme.strings.cartItemRemoved);
        } catch (error) {
          this.errors = { [line]: error.message || theme.strings.genericError };
          await theme.refreshCart();
        } finally {
          this.loading = false;
        }
      },

      async saveNote(note) {
        try {
          await theme.fetchJSON(`${theme.routes.cart_update_url}.js`, {
            method: 'POST',
            body: JSON.stringify({ note }),
          });
        } catch (error) {
          this.errors = { note: error.message || theme.strings.genericError };
        }
      },

      announce(message) {
        const region = document.getElementById('CartStatus');
        if (region) region.textContent = message;
      },
    }));
  });
})();
