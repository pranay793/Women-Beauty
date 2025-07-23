document.addEventListener("DOMContentLoaded", () => {
  fetch("http://localhost:3000/products")
    .then(res => res.json())
    .then(products => {
      const featured = products.filter(p => p.rating >= 4);
      const carousel = document.getElementById("feature-product-carousel");

      let cartItems = JSON.parse(localStorage.getItem("cartItems") || "[]");
      let wishlistItems = JSON.parse(localStorage.getItem("wishlistItems") || "[]");

      updateHeaderCounts();

      featured.forEach(product => {
        const fullStars = Math.floor(product.rating);
        const halfStar = product.rating % 1 >= 0.5;
        const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);

        const starsHTML = `
          <div class="stars mb-2 text-warning">
            ${'<i class="fas fa-star"></i>'.repeat(fullStars)}
            ${halfStar ? '<i class="fas fa-star-half-alt"></i>' : ''}
            ${'<i class="far fa-star"></i>'.repeat(emptyStars)}
          </div>
        `;

        const cartIds = cartItems.map(item => typeof item === 'object' ? item.id : item);
        const wishlistIds = wishlistItems.map(item => typeof item === 'object' ? item.id : item);

        const isInCart = cartIds.includes(product.id);
        const isInWishlist = wishlistIds.includes(product.id);

        const box = document.createElement("div");
        box.className = "product-box px-2";

        box.innerHTML = `
          <a href="product-details.html?id=${product.id}" class="text-decoration-none text-dark">
            <div class="product-card p-3 position-relative" data-id="${product.id}">
              <div class="product-icons position-absolute top-0 end-0 m-2 d-flex flex-column z-1">
                <button class="btn btn-sm rounded-circle wishlist-btn ${isInWishlist ? 'active' : ''}" data-id="${product.id}">
                  <i class="fas fa-heart"></i>
                </button>
                <button class="btn btn-sm rounded-circle cart-btn ${isInCart ? 'active' : ''}" data-id="${product.id}">
                  <i class="fas fa-shopping-cart"></i>
                </button>
              </div>
              <div class="product-box-img mb-3">
                <img src="${product.image}" alt="${product.title}" class="img-fluid">
              </div>
            </div>
            <h6 class="fw-semibold">${product.title}</h6>
            <p class="mb-1">
              <del>$${(product.price + 5).toFixed(2)}</del> 
              <span class="text-danger fw-bold">$${product.price.toFixed(2)}</span>
            </p>
            ${starsHTML}
          </a>
        `;

        carousel.appendChild(box);

        const wishlistBtn = box.querySelector(".wishlist-btn");
        const cartBtn = box.querySelector(".cart-btn");

        wishlistBtn.addEventListener("click", (e) => {
          e.preventDefault();
          e.stopPropagation();
          const id = parseInt(wishlistBtn.dataset.id);
          let updated = JSON.parse(localStorage.getItem("wishlistItems") || "[]");
          updated = updated.map(i => typeof i === 'object' ? i.id : i);

          if (updated.includes(id)) {
            updated = updated.filter(i => i !== id);
            wishlistBtn.classList.remove("active");
          } else {
            updated.push(id);
            wishlistBtn.classList.add("active");
          }

          localStorage.setItem("wishlistItems", JSON.stringify(updated));
          updateHeaderCounts();
          updateAllIcons(id, 'wishlist', updated.includes(id));
        });

        cartBtn.addEventListener("click", (e) => {
          e.preventDefault();
          e.stopPropagation();
          const id = parseInt(cartBtn.dataset.id);
          let updated = JSON.parse(localStorage.getItem("cartItems") || "[]");
          updated = updated.map(i => typeof i === 'object' ? i.id : i);

          if (updated.includes(id)) {
            updated = updated.filter(i => i !== id);
            cartBtn.classList.remove("active");
          } else {
            updated.push(id);
            cartBtn.classList.add("active");
          }

          localStorage.setItem("cartItems", JSON.stringify(updated));
          updateHeaderCounts();
          updateAllIcons(id, 'cart', updated.includes(id));
        });
      });

      $('#feature-product-carousel').slick({
        slidesToShow: 4,
        slidesToScroll: 1,
        arrows: true,
        dots: false,
        autoplay: true,
        autoplaySpeed: 2500,
        prevArrow: `<button type="button" class="slick-prev slick-arrow"><i class="fas fa-chevron-left"></i></button>`,
        nextArrow: `<button type="button" class="slick-next slick-arrow"><i class="fas fa-chevron-right"></i></button>`,
        responsive: [
          { breakpoint: 1200, settings: { slidesToShow: 3 } },
          { breakpoint: 992, settings: { slidesToShow: 2 } },
          { breakpoint: 576, settings: { slidesToShow: 1 } }
        ]
      });

      syncIconStates(); // ✅ Make sure icons match localStorage on page load
    })
    .catch(err => console.error("❌ Error loading featured products:", err));
});

// ✅ Update cart/wishlist count in header
function updateHeaderCounts() {
  const cartItems = JSON.parse(localStorage.getItem("cartItems") || "[]");
  const wishlistItems = JSON.parse(localStorage.getItem("wishlistItems") || "[]");

  const cartCount = document.querySelector(".cart-count");
  const wishlistCount = document.querySelector(".wishlist-count");

  if (cartCount) cartCount.textContent = cartItems.length;
  if (wishlistCount) wishlistCount.textContent = wishlistItems.length;
}

// ✅ Update all matching icon buttons across the page when changed
function updateAllIcons(productId, type, isActive) {
  const selector = type === 'cart' ? '.cart-btn' : '.wishlist-btn';
  document.querySelectorAll(`${selector}[data-id="${productId}"]`).forEach(btn => {
    btn.classList.toggle('active', isActive);
  });
}

// ✅ Make all icons reflect localStorage state on load
function syncIconStates() {
  const cartItems = JSON.parse(localStorage.getItem("cartItems") || "[]").map(i => typeof i === 'object' ? i.id : i);
  const wishlistItems = JSON.parse(localStorage.getItem("wishlistItems") || "[]").map(i => typeof i === 'object' ? i.id : i);

  document.querySelectorAll(".cart-btn").forEach(btn => {
    const id = parseInt(btn.dataset.id);
    btn.classList.toggle("active", cartItems.includes(id));
  });

  document.querySelectorAll(".wishlist-btn").forEach(btn => {
    const id = parseInt(btn.dataset.id);
    btn.classList.toggle("active", wishlistItems.includes(id));
  });
}
