document.addEventListener('alpine:init', () => {
  const theme = window.theme;

  Alpine.data('quickAdd', () => ({
    loading: false,
    error: '',

    async submit(event) {
      if (theme.settings.cartType !== 'drawer') return;
      event.preventDefault();

      this.loading = true;
      this.error = '';
      try {
        await theme.fetchJSON(`${theme.routes.cart_add_url}.js`, {
          method: 'POST',
          body: new FormData(event.target),
        });
        const cart = await theme.fetchJSON(`${theme.routes.cart_url}.js`);
        theme.emit('cart:updated', { cart });
        theme.emit('added-to-cart');
      } catch (error) {
        this.error = error.message || theme.strings.genericError;
      } finally {
        this.loading = false;
      }
    },
  }));

  Alpine.store('cart', {
    items: [],
    itemCount: 0,
    totalPrice: '',

    format(cents, currency) {
      return new Intl.NumberFormat(theme.locale, { style: 'currency', currency }).format(cents / 100);
    },

    apply(cart) {
      this.items = cart.items.map((item) => ({
        ...item,
        formatted_price: this.format(item.final_line_price, cart.currency),
      }));
      this.itemCount = cart.item_count;
      this.totalPrice = this.format(cart.total_price, cart.currency);
    },

    async fetchCartData() {
      try {
        this.apply(await theme.fetchJSON(`${theme.routes.cart_url}.js`));
      } catch (error) {
        console.error(error);
      }
    },

    async change(key, quantity) {
      try {
        const cart = await theme.fetchJSON(`${theme.routes.cart_change_url}.js`, {
          method: 'POST',
          body: JSON.stringify({ id: key, quantity }),
        });
        this.apply(cart);
        theme.emit('cart:updated', { cart });
      } catch (error) {
        console.error(error);
      }
    },

    remove(key) {
      return this.change(key, 0);
    },

    updateQuantity(key, quantity) {
      return this.change(key, Math.max(1, Number(quantity) || 1));
    },
  });
});
