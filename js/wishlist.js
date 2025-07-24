document.addEventListener("DOMContentLoaded", () => {
    let wishlistItems = (JSON.parse(localStorage.getItem("wishlistItems")) || []).map(Number);
    let cartItems = JSON.parse(localStorage.getItem("cartItems")) || [];
    const wishlistContainer = document.getElementById("wishlist-products");
  
    function updateHeaderCounts() {
      const wishlistCountEl = document.getElementById("wishlist-count");
      const cartCountEl = document.getElementById("cart-count");
  
      if (wishlistCountEl) wishlistCountEl.textContent = wishlistItems.length;
      if (cartCountEl) cartCountEl.textContent = cartItems.length;
    }
  
    if (!wishlistContainer) {
      console.error("❌ wishlist-products container not found in DOM.");
      return;
    }
  
    if (!wishlistItems.length) {
      wishlistContainer.innerHTML = `<p class="text-center">No products in your wishlist.</p>`;
      updateHeaderCounts(); // Ensure count shows 0
      return;
    }
  
    fetch("http://localhost:3000/products")
      .then(res => res.json())
      .then(products => {
        const filtered = products.filter(p => wishlistItems.includes(Number(p.id)));
  
        if (!filtered.length) {
          wishlistContainer.innerHTML = `<p class="text-center">No products found in your wishlist.</p>`;
          updateHeaderCounts();
          return;
        }
  
        filtered.forEach(product => {
          const fullStars = Math.floor(product.rating || 0);
          const halfStar = product.rating % 1 >= 0.5;
          const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
  
          const starsHTML = `
            <div class="stars mb-2">
              ${'<i class="fas fa-star text-warning"></i>'.repeat(fullStars)}
              ${halfStar ? '<i class="fas fa-star-half-alt text-warning"></i>' : ''}
              ${'<i class="far fa-star text-warning"></i>'.repeat(emptyStars)}
            </div>
          `;
  
          const col = document.createElement("div");
          col.className = "col-md-3 col-sm-6 mb-4";
          col.innerHTML = `
            <div class="card h-100">
              <a href="product-details.html?id=${product.id}">
                <img src="${product.image}" class="card-img-top" alt="${product.title}">
              </a>
              <div class="card-body text-center">
                <h6 class="card-title">${product.title}</h6>
                <p class="mb-1">
                  <del>$${(product.price + 5).toFixed(2)}</del>
                  <span class="fw-bold text-danger">$${product.price.toFixed(2)}</span>
                </p>
                ${starsHTML}
                <div class="d-flex justify-content-center gap-2 mt-3">
                  <button class="btn btn-sm btn-outline-danger remove-btn rounded-0" data-id="${product.id}">
                    <i class="fas fa-trash"></i> Remove
                  </button>
                  <button class="btn btn-sm rounded-0 cart-btn2" data-id="${product.id}">
                    <i class="fas fa-shopping-cart"></i> Add to Cart
                  </button>
                </div>
              </div>
            </div>
          `;
  
          wishlistContainer.appendChild(col);
        });
  
        // Remove from Wishlist
        document.querySelectorAll(".remove-btn").forEach(btn => {
          btn.addEventListener("click", () => {
            const id = parseInt(btn.getAttribute("data-id"));
            wishlistItems = wishlistItems.filter(itemId => itemId !== id);
            localStorage.setItem("wishlistItems", JSON.stringify(wishlistItems));
            updateHeaderCounts();
            location.reload();
          });
        });
  
        // Add to Cart
        document.querySelectorAll(".cart-btn").forEach(btn => {
          btn.addEventListener("click", () => {
            const id = parseInt(btn.getAttribute("data-id"));
            if (!cartItems.includes(id)) {
              cartItems.push(id);
              localStorage.setItem("cartItems", JSON.stringify(cartItems));
              alert("Added to cart!");
              updateHeaderCounts();
            } else {
              alert("Product already in cart.");
            }
          });
        });
  
        updateHeaderCounts(); // Initial call after rendering
      })
      .catch(err => {
        console.error("❌ Failed to load wishlist products:", err);
        wishlistContainer.innerHTML = `<p>Error loading wishlist products.</p>`;
      });
  });
  