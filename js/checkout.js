document.addEventListener("DOMContentLoaded", () => {
  const summaryContainer = document.getElementById("order-summary");
  const subtotalEl = document.getElementById("subtotal");
  const totalEl = document.getElementById("total");

  const buyNowItem = JSON.parse(localStorage.getItem("buyNowItem"));
  const cartItems = JSON.parse(localStorage.getItem("cartItems")) || [];

  let itemsToShow = [];

  if (buyNowItem) {
    itemsToShow = [buyNowItem];
    renderSummary(itemsToShow);
  } else {
    fetch("http://localhost:3000/products")
      .then(res => res.json())
      .then(products => {
        const enrichedCart = cartItems.map(cartItem => {
          const product = products.find(p => String(p.id) === String(cartItem.id));
          if (product) {
            return {
              id: product.id,
              name: product.title,
              image: product.image,
              price: product.price,
              quantity: cartItem.quantity
            };
          }
          return null;
        }).filter(Boolean);

        itemsToShow = enrichedCart;
        renderSummary(itemsToShow);
      })
      .catch(err => {
        console.error("Failed to load products for checkout:", err);
        summaryContainer.innerHTML = `<p class="text-danger">Failed to load order summary.</p>`;
      });
  }

  function renderSummary(items) {
    summaryContainer.innerHTML = "";

    if (!items || items.length === 0) {
      summaryContainer.innerHTML = "<p>Your cart is empty.</p>";
      subtotalEl.textContent = "₹0";
      totalEl.textContent = "₹0";
      return;
    }

    let subtotal = 0;

    items.forEach(item => {
      const itemTotal = item.price * (item.quantity || 1);
      subtotal += itemTotal;

      const itemEl = document.createElement("div");
      itemEl.classList.add("summary-item");
      itemEl.innerHTML = `
        <div class="d-flex align-items-center mb-3">
          <img src="${item.image}" alt="${item.name}" style="width: 80px; height: 80px; object-fit: cover;" class="me-3">
          <div>
            <h6 class="mb-1">${item.name}</h6>
            <p class="mb-0">Quantity: ${item.quantity || 1}</p>
            <p class="mb-0">Price: ₹${item.price}</p>
            <p class="mb-0 fw-bold">Total: ₹${itemTotal}</p>
          </div>
        </div>
        <hr/>
      `;
      summaryContainer.appendChild(itemEl);
    });

    subtotalEl.textContent = `₹${subtotal}`;
    totalEl.textContent = `₹${subtotal}`;
  }

  // ✅ Form validation + order redirect
  const checkoutForm = document.getElementById("checkout-form");

  if (checkoutForm) {
    checkoutForm.addEventListener("submit", function (e) {
      e.preventDefault();

      const firstName = document.getElementById("first-name");
      const lastName = document.getElementById("last-name");
      const email = document.getElementById("email");
      const phone = document.getElementById("phone");
      const address = document.getElementById("address");
      const city = document.getElementById("city");
      const state = document.getElementById("state");
      const zip = document.getElementById("zip");
      const paymentMethod = document.querySelector('input[name="payment-method"]:checked');

      // Reset previous error messages
      const fields = [firstName, lastName, email, phone, address, city, state, zip];
      fields.forEach(field => {
        const errorEl = field.nextElementSibling;
        if (errorEl && errorEl.tagName === "SMALL") errorEl.textContent = "";
      });

      const paymentError = document.getElementById("error-payment");
      if (paymentError) paymentError.textContent = "";

      let isValid = true;

      // Validation
      if (!firstName.value.trim()) {
        document.getElementById("error-first-name").textContent = "First Name is required.";
        isValid = false;
      }

      if (!lastName.value.trim()) {
        document.getElementById("error-last-name").textContent = "Last Name is required.";
        isValid = false;
      }

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) {
        document.getElementById("error-email").textContent = "Enter a valid email address.";
        isValid = false;
      }

      if (!/^\d{10}$/.test(phone.value.trim())) {
        document.getElementById("error-phone").textContent = "Enter a valid 10-digit phone number.";
        isValid = false;
      }

      if (!address.value.trim()) {
        document.getElementById("error-address").textContent = "Address is required.";
        isValid = false;
      }

      if (!city.value.trim()) {
        document.getElementById("error-city").textContent = "City is required.";
        isValid = false;
      }

      if (!state.value.trim()) {
        document.getElementById("error-state").textContent = "State is required.";
        isValid = false;
      }

      if (!/^\d{5,6}$/.test(zip.value.trim())) {
        document.getElementById("error-zip").textContent = "Enter a valid ZIP code.";
        isValid = false;
      }

      if (!paymentMethod) {
        document.getElementById("error-payment").textContent = "Please select a payment method.";
        isValid = false;
      }

      if (isValid) {
        const orderId = "ORD" + Math.floor(Math.random() * 1000000 + 100000);
        localStorage.setItem("orderId", orderId);
        window.location.href = `thankyou.html?orderId=${orderId}`;
      }
    });
  }
});

// ✅ Clear Buy Now item
window.addEventListener("beforeunload", () => {
  localStorage.removeItem("buyNowItem");
});
