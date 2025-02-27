Object.defineProperty(Object.prototype, 'isEmpty', {
  value: function () {
    return Object.keys(this).length === 0;
  },
  enumerable: false,
});
