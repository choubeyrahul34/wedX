(function () {
  var KEY = "wedx-cart-v1";

  function read() {
    try {
      var data = JSON.parse(localStorage.getItem(KEY) || "[]");
      return Array.isArray(data) ? data : [];
    } catch (error) {
      return [];
    }
  }

  function updateBadges(items) {
    var count = items.reduce(function (sum, item) {
      return sum + item.qty;
    }, 0);
    document.querySelectorAll("[data-cart-count]").forEach(function (node) {
      node.textContent = String(count);
    });
  }

  function write(items) {
    try {
      localStorage.setItem(KEY, JSON.stringify(items));
    } catch (error) {
      /* Storage can be blocked in private browsing. The page still updates. */
    }
    updateBadges(items);
  }

  function add(qty, note) {
    var product = window.WEDX_CONFIG.product;
    var items = read();
    var existing = items.find(function (item) {
      return item.id === product.id;
    });
    var previous = existing ? existing.qty : 0;
    var next = Math.min(10, previous + qty);

    if (existing) {
      existing.qty = next;
      if (note) existing.note = note;
    } else {
      items.push({
        id: product.id,
        name: product.name,
        size: product.size,
        price: product.price,
        image: product.image,
        qty: next,
        note: note || ""
      });
    }

    write(items);
    return { qty: next, capped: next < previous + qty };
  }

  function setQty(id, qty) {
    var items = read();
    if (qty <= 0) {
      write(items.filter(function (item) {
        return item.id !== id;
      }));
      return;
    }
    items.forEach(function (item) {
      if (item.id === id) item.qty = Math.min(10, qty);
    });
    write(items);
  }

  function totals(items) {
    var config = window.WEDX_CONFIG;
    var sub = items.reduce(function (sum, item) {
      return sum + item.price * item.qty;
    }, 0);
    var ship = sub === 0 || sub >= config.freeShippingOver ? 0 : config.shippingFee;
    return { sub: sub, ship: ship, total: sub + ship };
  }

  window.WedXCart = {
    read: read,
    write: write,
    add: add,
    setQty: setQty,
    totals: totals,
    updateBadges: updateBadges
  };
})();
