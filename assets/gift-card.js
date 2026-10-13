document.addEventListener('alpine:init', () => {
  Alpine.data('giftCard', ({ code, qrIdentifier }) => {
    let timer;

    return {
      status: '',

      init() {
        const qr = this.$el.querySelector('[data-gift-card-qr]');
        if (qr && window.QRCode) new QRCode(qr, { text: qrIdentifier, width: 120, height: 120 });
      },

      async copy() {
        clearTimeout(timer);
        try {
          await navigator.clipboard.writeText(code);
          this.status = theme.strings.codeCopied;
        } catch {
          this.status = theme.strings.copyFailed;
        }
        timer = setTimeout(() => (this.status = ''), 3000);
      },

      print() {
        window.print();
      },
    };
  });
});
