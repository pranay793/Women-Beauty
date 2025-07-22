document.addEventListener("DOMContentLoaded", () => {
  const cartTableBody = document.getElementById("cart-table-body");
  const subtotalEl = document.getElementById("subtotal");
  const totalEl = document.getElementById("total");
  const checkoutBtn = document.getElementById("proceed-checkout"); // ← new

  // Step 1: Read cartItems from localStorage
  let rawCart = JSON.parse(localStorage.getItem("cartItems")) || [];

  // Step 2: Convert to consistent format [{ id: "1", quantity: 1 }]
  const cartMap = new Map();

  rawCart.forEach(item => {
    if (typeof item === "object" && item.id) {
      const id = String(item.id);
      const qty = parseInt(item.quantity) || 1;
      cartMap.set(id, (cartMap.get(id) || 0) + qty);
    } else {
      const id = String(item);
      cartMap.set(id, (cartMap.get(id) || 0) + 1);
    }
  });

  // Final normalized cart array
  let cartItems = Array.from(cartMap.entries()).map(([id, quantity]) => ({ id, quantity }));

  // Save back the normalized format
  localStorage.setItem("cartItems", JSON.stringify(cartItems));

  function saveCart() {
    localStorage.setItem("cartItems", JSON.stringify(cartItems));
  }

  function updateTotals(products) {
    let subtotal = 0;
    products.forEach(product => {
      const item = cartItems.find(i => i.id === String(product.id));
      subtotal += product.price * (item?.quantity || 1);
    });

    subtotalEl.textContent = `₹${subtotal.toFixed(2)}`;
    totalEl.textContent = `₹${subtotal.toFixed(2)}`;
  }

  function renderCart(products) {
    cartTableBody.innerHTML = "";

    if (!products.length || !cartItems.length) {
      cartTableBody.innerHTML = `<tr><td colspan="4" class="text-center py-5">Your cart is empty.</td></tr>`;
      subtotalEl.textContent = "₹0.00";
      totalEl.textContent = "₹0.00";
      return;
    }

    products.forEach(product => {
      const cartItem = cartItems.find(i => i.id === String(product.id));
      const qty = cartItem?.quantity || 1;

      const row = document.createElement("tr");
      row.innerHTML = `
        <td>
          <div class="d-flex align-items-center">
            <img src="${product.image}" alt="${product.title}" class="img-fluid me-3"
              style="width: 60px; height: 60px; object-fit: cover;">
            <span>${product.title}</span>
          </div>
        </td>
        <td class="text-center">₹${product.price.toFixed(2)}</td>
        <td class="text-center">
          <div class="d-flex justify-content-center align-items-center gap-2">
            <button class="btn btn-sm btn-outline-secondary qty-btn" data-id="${product.id}" data-action="decrease">–</button>
            <span class="qty-value" id="qty-${product.id}">${qty}</span>
            <button class="btn btn-sm btn-outline-secondary qty-btn" data-id="${product.id}" data-action="increase">+</button>
          </div>
        </td>
        <td class="text-center">
          <button class="btn btn-sm btn-outline-danger remove-btn" data-id="${product.id}">
            <i class="fas fa-trash"></i>
          </button>
        </td>`;
      cartTableBody.appendChild(row);
    });

    document.querySelectorAll(".qty-btn").forEach(button => {
      button.addEventListener("click", () => {
        const id = String(button.getAttribute("data-id"));
        const action = button.getAttribute("data-action");
        const item = cartItems.find(i => i.id === id);
        if (!item) return;

        if (action === "increase") {
          item.quantity++;
        } else if (action === "decrease" && item.quantity > 1) {
          item.quantity--;
        }

        document.getElementById(`qty-${id}`).textContent = item.quantity;
        saveCart();
        updateTotals(products);
      });
    });

    document.querySelectorAll(".remove-btn").forEach(button => {
      button.addEventListener("click", () => {
        const id = String(button.getAttribute("data-id"));
        cartItems = cartItems.filter(i => i.id !== id);
        saveCart();
        location.reload();
      });
    });

    updateTotals(products);
  }

  // Fetch products and match
  fetch("http://localhost:3000/products")
    .then(res => res.json())
    .then(products => {
      const matched = products.filter(product =>
        cartItems.some(item => item.id === String(product.id))
      );
      renderCart(matched);
    })
    .catch(err => {
      console.error("Error loading products:", err);
      cartTableBody.innerHTML = `<tr><td colspan="4" class="text-danger text-center">Error loading cart items.</td></tr>`;
    });

  // ✅ Proceed to Checkout button
  if (checkoutBtn) {
    checkoutBtn.addEventListener("click", () => {
      // Clear buyNowItem to allow full cart rendering in checkout.js
      localStorage.removeItem("buyNowItem");
      window.location.href = "checkout.html";
    });
  }
});
