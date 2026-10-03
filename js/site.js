(function () {
  function money(amount) {
    var formatted = new Intl.NumberFormat("en-IN", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
    return "₹" + formatted;
  }

  function openMail(subject, body) {
    var link = document.createElement("a");
    link.href = "mailto:" + window.WEDX_CONFIG.email + "?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(body);
    link.hidden = true;
    document.body.appendChild(link);
    link.click();
    link.remove();
  }

  function toast(message) {
    var node = document.querySelector("[data-toast]");
    if (!node) {
      node = document.createElement("div");
      node.className = "toast";
      node.setAttribute("data-toast", "");
      node.setAttribute("role", "status");
      document.body.appendChild(node);
    }
    node.textContent = message;
    node.classList.add("is-on");
    clearTimeout(node._timer);
    node._timer = setTimeout(function () {
      node.classList.remove("is-on");
    }, 2200);
  }

  function bindHouse() {
    var config = window.WEDX_CONFIG;
    document.querySelectorAll("[data-mail]").forEach(function (node) {
      node.href = "mailto:" + config.email;
      node.textContent = config.email;
    });
    document.querySelectorAll("[data-phone]").forEach(function (node) {
      node.href = config.phoneHref;
      node.textContent = config.phoneDisplay;
    });
    document.querySelectorAll("[data-bind='address']").forEach(function (node) {
      node.textContent = config.address;
    });
    document.querySelectorAll("[data-bind='legal']").forEach(function (node) {
      node.textContent = config.legalName;
    });
    document.querySelectorAll("[data-price]").forEach(function (node) {
      node.textContent = money(config.product.price);
    });
    document.querySelectorAll("[data-threshold]").forEach(function (node) {
      node.textContent = money(config.freeShippingOver);
    });
    document.querySelectorAll("[data-ship-fee]").forEach(function (node) {
      node.textContent = money(config.shippingFee);
    });
    var year = String(new Date().getFullYear());
    document.querySelectorAll("[data-year]").forEach(function (node) {
      node.textContent = year;
    });
    window.WedXCart.updateBadges(window.WedXCart.read());
  }

  function setupMenu() {
    var menuBtn = document.querySelector("[data-menu]");
    var nav = document.querySelector("[data-nav]");
    var backdrop = document.querySelector("[data-backdrop]");
    if (!menuBtn || !nav) return;
    var mobileQuery = window.matchMedia("(max-width: 900px)");

    function setMenu(open) {
      nav.classList.toggle("is-open", open);
      menuBtn.setAttribute("aria-expanded", String(open));
      if (backdrop) backdrop.hidden = !open;
      document.body.classList.toggle("menu-open", open);
      if (mobileQuery.matches && !open) nav.setAttribute("inert", "");
      else nav.removeAttribute("inert");
    }

    setMenu(false);
    menuBtn.addEventListener("click", function () {
      setMenu(!nav.classList.contains("is-open"));
    });
    if (backdrop) {
      backdrop.addEventListener("click", function () {
        setMenu(false);
      });
    }
    nav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        setMenu(false);
      });
    });
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") setMenu(false);
    });
    mobileQuery.addEventListener("change", function () {
      setMenu(false);
    });
  }

  function setupGallery() {
    var main = document.querySelector("[data-main-image]");
    if (!main) return;
    document.querySelectorAll("[data-thumb]").forEach(function (button) {
      button.addEventListener("click", function () {
        main.src = button.getAttribute("data-thumb");
        document.querySelectorAll("[data-thumb]").forEach(function (item) {
          item.classList.toggle("is-selected", item === button);
        });
      });
    });
  }

  function changeQty(button, delta) {
    var wrap = button.closest(".qty");
    var input = wrap.querySelector("[data-qty]");
    var next = Math.min(10, Math.max(1, (parseInt(input.value, 10) || 1) + delta));
    input.value = String(next);
  }

  function setupQty() {
    document.querySelectorAll("[data-qty-minus]").forEach(function (button) {
      button.addEventListener("click", function () {
        changeQty(button, -1);
      });
    });
    document.querySelectorAll("[data-qty-plus]").forEach(function (button) {
      button.addEventListener("click", function () {
        changeQty(button, 1);
      });
    });
  }

  function setupAdd() {
    document.querySelectorAll("[data-add]").forEach(function (button) {
      button.addEventListener("click", function () {
        var scope = button.closest("[data-product]") || button.parentElement;
        var input = scope.querySelector("[data-qty]");
        var noteField = scope.querySelector("[data-note]");
        var qty = input ? Math.min(10, Math.max(1, parseInt(input.value, 10) || 1)) : 1;
        var note = noteField ? noteField.value.trim() : "";
        var result = window.WedXCart.add(qty, note);
        toast(result.capped ? "You can add up to 10 of this diffuser." : "Added to your bag");
      });
    });

    document.querySelectorAll("[data-gift-form]").forEach(function (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        var noteField = form.querySelector("[data-note]");
        var note = noteField ? noteField.value.trim() : "";
        var result = window.WedXCart.add(1, note);
        toast(result.capped ? "You can add up to 10 of this diffuser." : "Added to your bag");
      });
    });
  }

  function renderLines() {
    var host = document.querySelector("[data-lines]");
    if (!host) return;
    var items = window.WedXCart.read();
    var empty = document.querySelector("[data-empty]");
    var summary = document.querySelector("[data-summary]");
    host.replaceChildren();
    var hasItems = items.length > 0;
    if (empty) empty.hidden = hasItems;
    if (summary) summary.hidden = !hasItems;

    items.forEach(function (item) {
      var row = document.createElement("article");
      row.className = "line";

      var image = document.createElement("img");
      image.src = item.image;
      image.alt = "";
      image.width = 96;
      image.height = 96;

      var info = document.createElement("div");
      var title = document.createElement("h2");
      title.textContent = item.name;
      var size = document.createElement("p");
      size.textContent = item.size;
      info.append(title, size);
      if (item.note) {
        var note = document.createElement("p");
        note.className = "note";
        note.textContent = "Gift note: " + item.note;
        info.append(note);
      }

      var controls = document.createElement("div");
      controls.className = "qty";
      var minus = document.createElement("button");
      minus.type = "button";
      minus.textContent = "−";
      minus.setAttribute("aria-label", "Decrease quantity");
      minus.addEventListener("click", function () {
        window.WedXCart.setQty(item.id, item.qty - 1);
        renderLines();
      });
      var count = document.createElement("span");
      count.textContent = String(item.qty);
      var plus = document.createElement("button");
      plus.type = "button";
      plus.textContent = "+";
      plus.setAttribute("aria-label", "Increase quantity");
      plus.addEventListener("click", function () {
        window.WedXCart.setQty(item.id, item.qty + 1);
        renderLines();
      });
      controls.append(minus, count, plus);

      var remove = document.createElement("button");
      remove.type = "button";
      remove.className = "text-btn";
      remove.textContent = "Remove";
      remove.addEventListener("click", function () {
        window.WedXCart.setQty(item.id, 0);
        renderLines();
      });
      info.append(controls, remove);

      var price = document.createElement("p");
      price.className = "line-price";
      price.textContent = money(item.price * item.qty);
      row.append(image, info, price);
      host.append(row);
    });

    var figures = window.WedXCart.totals(items);
    var sub = document.querySelector("[data-sub]");
    var ship = document.querySelector("[data-ship]");
    var total = document.querySelector("[data-total]");
    if (sub) sub.textContent = money(figures.sub);
    if (ship) ship.textContent = !hasItems ? "—" : figures.ship === 0 ? "Free" : money(figures.ship);
    if (total) total.textContent = money(figures.total);
  }

  function showReceipt(receipt) {
    var grid = document.querySelector("[data-checkout]");
    var panel = document.querySelector("[data-receipt]");
    if (!panel) return;
    if (grid) grid.hidden = true;
    panel.hidden = false;
    panel.replaceChildren();

    var eyebrow = document.createElement("p");
    eyebrow.className = "eyebrow";
    eyebrow.textContent = receipt.id;

    var title = document.createElement("h1");
    title.textContent = "Order received";

    var lead = document.createElement("p");
    lead.textContent = receipt.pay === "cod"
      ? "You chose pay on delivery. We will confirm this order before it is dispatched. Nothing has been charged online."
      : "Nothing has been charged. We will send a secure payment link to " + receipt.email + ".";

    var amount = document.createElement("p");
    amount.textContent = "Amount due " + receipt.total + " · " + (receipt.pay === "cod" ? "Pay on delivery" : "Pay online");

    var who = document.createElement("p");
    who.textContent = receipt.name + " · " + receipt.phone;

    var where = document.createElement("p");
    where.textContent = receipt.address + ", " + receipt.city + ", " + receipt.state + " " + receipt.pin;

    var back = document.createElement("a");
    back.className = "btn";
    back.href = "shop.html";
    back.textContent = "Back to the shop";
    back.style.marginTop = "28px";

    panel.append(eyebrow, title, lead, amount, who, where, back);
  }

  function validPhone(value) {
    var digits = String(value).replace(/\D/g, "");
    var local = digits.length === 12 && digits.indexOf("91") === 0 ? digits.slice(2) : digits;
    return /^[6-9]\d{9}$/.test(local);
  }

  function setupCheckout() {
    var form = document.querySelector("[data-checkout-form]");
    if (!form) return;
    renderLines();

    if (location.hash === "#confirmed") {
      try {
        var saved = JSON.parse(sessionStorage.getItem("wedx-receipt") || "null");
        if (saved) showReceipt(saved);
      } catch (error) {
        /* Ignore a damaged saved receipt. */
      }
    }

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      var items = window.WedXCart.read();
      var error = form.querySelector("[data-form-error]");
      if (!items.length) {
        error.hidden = false;
        error.textContent = "Your bag is empty.";
        return;
      }

      var data = new FormData(form);
      var name = String(data.get("name") || "").trim();
      var email = String(data.get("email") || "").trim();
      var phone = String(data.get("phone") || "").trim();
      var address = String(data.get("address") || "").trim();
      var city = String(data.get("city") || "").trim();
      var state = String(data.get("state") || "").trim();
      var pin = String(data.get("pin") || "").trim();
      var pay = String(data.get("pay") || "online");

      if (!validPhone(phone)) {
        error.hidden = false;
        error.textContent = "Enter a 10-digit Indian mobile number.";
        return;
      }
      if (!/^\d{6}$/.test(pin)) {
        error.hidden = false;
        error.textContent = "Enter a 6-digit PIN code.";
        return;
      }

      error.hidden = true;
      var figures = window.WedXCart.totals(items);
      var receipt = {
        id: "WX-" + Math.floor(100000 + Math.random() * 900000),
        name: name,
        email: email,
        phone: phone,
        address: address,
        city: city,
        state: state,
        pin: pin,
        pay: pay,
        total: money(figures.total),
        items: items.map(function (item) {
          return item.name + " × " + item.qty + (item.note ? " (" + item.note + ")" : "");
        })
      };

      try {
        sessionStorage.setItem("wedx-receipt", JSON.stringify(receipt));
      } catch (storageError) {
        /* The receipt still shows on this page. */
      }

      var body = [
        receipt.id,
        receipt.items.join("\n"),
        "Total: " + receipt.total,
        "Payment: " + (pay === "cod" ? "Pay on delivery" : "Pay online"),
        "",
        name,
        email,
        phone,
        address,
        city + ", " + state + " " + pin
      ].join("\n");

      window.WedXCart.write([]);
      showReceipt(receipt);
      location.hash = "confirmed";
      openMail("WedX order " + receipt.id, body);
    });
  }

  function setupContact() {
    var form = document.querySelector("[data-contact-form]");
    if (!form) return;
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      var data = new FormData(form);
      var name = String(data.get("name") || "").trim();
      var email = String(data.get("email") || "").trim();
      var phone = String(data.get("phone") || "").trim();
      var message = String(data.get("message") || "").trim();
      var body = "Name: " + name + "\nEmail: " + email + "\nPhone: " + phone + "\n\n" + message;
      form.hidden = true;
      var thanks = document.querySelector("[data-contact-thanks]");
      if (thanks) thanks.hidden = false;
      openMail("Note for WedX", body);
    });
  }

  function init() {
    bindHouse();
    setupMenu();
    setupGallery();
    setupQty();
    setupAdd();
    setupCheckout();
    setupContact();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
