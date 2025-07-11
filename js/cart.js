document.addEventListener("DOMContentLoaded", () => {
    const cartTableBody = document.getElementById("cart-table-body");
    const subtotalEl = document.getElementById("subtotal");
    const totalEl = document.getElementById("total");
  
    // Load cart item IDs
    let cartItems = JSON.parse(localStorage.getItem("cartItems")) || [];
    cartItems = cartItems.map(id => Number(id));
  
    // Load item quantities or default to 1
    let cartQuantities = JSON.parse(localStorage.getItem("cartQuantities")) || {};
  
    function saveQuantities() {
      localStorage.setItem("cartQuantities", JSON.stringify(cartQuantities));
    }
  
    function updateTotals(products) {
      let subtotal = 0;
      products.forEach(product => {
        const qty = cartQuantities[product.id] || 1;
        subtotal += product.price * qty;
      });
      subtotalEl.textContent = `$${subtotal.toFixed(2)}`;
      totalEl.textContent = `$${subtotal.toFixed(2)}`;
    }
  
    function renderCart(products) {
      cartTableBody.innerHTML = "";
  
      if (products.length === 0 || cartItems.length === 0) {
        cartTableBody.innerHTML = `
          <tr>
            <td colspan="4" class="text-center py-5">Your cart is empty.</td>
          </tr>`;
        subtotalEl.textContent = "$0.00";
        totalEl.textContent = "$0.00";
        return;
      }
  
      products.forEach(product => {
        const qty = cartQuantities[product.id] || 1;
  
        const row = document.createElement("tr");
        row.innerHTML = `
          <td>
            <div class="d-flex align-items-center">
              <img src="${product.image}" alt="${product.title}" class="img-fluid me-3"
                style="width: 60px; height: 60px; object-fit: cover;">
              <span>${product.title}</span>
            </div>
          </td>
          <td class="text-center">$${product.price.toFixed(2)}</td>
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
          </td>
        `;
        cartTableBody.appendChild(row);
      });
  
      // Quantity buttons
      document.querySelectorAll(".qty-btn").forEach(button => {
        button.addEventListener("click", () => {
          const id = Number(button.getAttribute("data-id"));
          const action = button.getAttribute("data-action");
          const currentQty = cartQuantities[id] || 1;
  
          if (action === "increase") {
            cartQuantities[id] = currentQty + 1;
          } else if (action === "decrease" && currentQty > 1) {
            cartQuantities[id] = currentQty - 1;
          }
  
          document.getElementById(`qty-${id}`).textContent = cartQuantities[id];
          saveQuantities();
          updateTotals(products);
        });
      });
  
      // Remove item
      document.querySelectorAll(".remove-btn").forEach(button => {
        button.addEventListener("click", () => {
          const id = Number(button.getAttribute("data-id"));
          cartItems = cartItems.filter(itemId => itemId !== id);
          delete cartQuantities[id];
          localStorage.setItem("cartItems", JSON.stringify(cartItems));
          saveQuantities();
          location.reload();
        });
      });
  
      updateTotals(products);
    }
  
    // Fetch products and build cart
    fetch("http://localhost:3000/products")
      .then(res => res.json())
      .then(products => {
        const matchingProducts = products.filter(product =>
          cartItems.includes(Number(product.id))
        );
        renderCart(matchingProducts);
      })
      .catch(err => {
        console.error("Failed to load cart products:", err);
        cartTableBody.innerHTML = `
          <tr>
            <td colspan="4" class="text-center text-danger">Error loading cart items.</td>
          </tr>`;
      });
  });
  