let cartItems = JSON.parse(localStorage.getItem("cartItems")) || [];
let wishlistItems = JSON.parse(localStorage.getItem("wishlistItems")) || [];
let allProducts = [];

document.addEventListener("DOMContentLoaded", () => {
  const productList = document.getElementById("product-list");
  const filterPanel = document.getElementById("filter-panel");
  const brandFilterEl = document.getElementById("brand-filter-container");
  const priceMinRange = document.getElementById("price-min-range");
  const priceMaxRange = document.getElementById("price-max-range");
  const priceMin = document.getElementById("price-min");
  const priceMax = document.getElementById("price-max");
  const priceRangeLabel = document.getElementById("price-range-value");

  fetch("http://localhost:3000/products")
    .then(res => res.json())
    .then(products => {
      allProducts = products;

      const wishlistCountEl = document.getElementById("wishlist-count");
      const cartCountEl = document.getElementById("cart-count");

      function updateCounts() {
        if (cartCountEl) cartCountEl.textContent = cartItems.length;
        if (wishlistCountEl) wishlistCountEl.textContent = wishlistItems.length;
      }

      const isShopPage = window.location.pathname.includes("shop.html");
      const trendingIds = [2, 3, 6, 5, 7, 9, 13, 11];
      const filteredProducts = isShopPage
        ? products
        : products.filter(p => trendingIds.includes(Number(p.id)));

      const prices = products.map(p => p.price);
      const minPriceVal = Math.floor(Math.min(...prices));
      const maxPriceVal = Math.ceil(Math.max(...prices));

      // Set price range slider values
      if (priceMinRange && priceMaxRange && priceMin && priceMax && priceRangeLabel) {
        priceMinRange.min = minPriceVal;
        priceMinRange.max = maxPriceVal;
        priceMinRange.value = minPriceVal;

        priceMaxRange.min = minPriceVal;
        priceMaxRange.max = maxPriceVal;
        priceMaxRange.value = maxPriceVal;

        priceMin.value = minPriceVal;
        priceMax.value = maxPriceVal;

        priceRangeLabel.textContent = `${minPriceVal} - ${maxPriceVal}`;
      }

      // ✅ Show products in DOM
      const showProducts = (productArray) => {
        productArray.forEach(product => {
          const col = document.createElement("div");

          const availability = product.Availability || (product.id == 5 ? "Out of Stock" : "In Stock");
          product.Availability = availability;

          col.className = isShopPage
            ? "col-6 col-sm-6 col-md-4 mb-4"
            : "col-6 col-sm-6 col-md-3 mb-4";

          col.setAttribute("data-id", product.id);
          col.setAttribute("data-price", product.price);
          col.setAttribute("data-brand", product.brand || product.title.split(" ")[0]);
          col.setAttribute("data-availability", availability);

          const isInCart = cartItems.some(item => item.id === product.id || item === product.id);
          const isInWishlist = wishlistItems.some(item => item.id === product.id || item === product.id);

          // ✅ Dynamic star rating
          const rating = product.rating || 0;
          const fullStars = Math.floor(rating);
          const halfStar = rating % 1 >= 0.5;
          const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
          const starsHTML = `
            <div class="text-warning small">
              ${'<i class="fas fa-star"></i>'.repeat(fullStars)}
              ${halfStar ? '<i class="fas fa-star-half-alt"></i>' : ''}
              ${'<i class="far fa-star"></i>'.repeat(emptyStars)}
            </div>
          `;

          col.innerHTML = `
            <a href="product-details.html?id=${product.id}" class="text-decoration-none text-dark">
              <div class="product-card p-3 position-relative">
                <div class="product-icons position-absolute top-0 end-0 m-2 d-flex flex-column">
                  <button class="btn btn-sm rounded-circle wishlist-btn ${isInWishlist ? 'active' : ''}">
                    <i class="fas fa-heart"></i>
                  </button>
                  <button class="btn btn-sm rounded-circle cart-btn ${isInCart ? 'active' : ''}">
                    <i class="fas fa-shopping-cart"></i>
                  </button>
                </div>
                <img src="${product.image}" class="img-fluid mb-3" alt="${product.title}">
              </div>
              <div class="card-body p-0 text-center">
                <h6 class="card-title">${product.title}</h6>
                <p class="mb-1">
                <del>$${(product.price + 5).toFixed(2)}</del> 
                <span class="text-danger fw-bold">$${product.price.toFixed(2)}</span>
              </p>
                ${starsHTML}
              </div>
            </a>
          `;

          // ✅ Wishlist
          const wishlistBtn = col.querySelector(".wishlist-btn");
          wishlistBtn.addEventListener("click", (e) => {
            e.preventDefault();
            e.stopPropagation();
            wishlistBtn.classList.toggle("active");

            if (wishlistBtn.classList.contains("active")) {
              if (!wishlistItems.includes(product.id)) wishlistItems.push(product.id);
            } else {
              wishlistItems = wishlistItems.filter(id => id !== product.id);
            }

            localStorage.setItem("wishlistItems", JSON.stringify(wishlistItems));
            updateCounts();
          });

          // ✅ Cart
          const cartBtn = col.querySelector(".cart-btn");
          cartBtn.addEventListener("click", (e) => {
            e.preventDefault();
            e.stopPropagation();
            cartBtn.classList.toggle("active");

            if (cartBtn.classList.contains("active")) {
              if (!cartItems.includes(product.id)) cartItems.push(product.id);
            } else {
              cartItems = cartItems.filter(id => id !== product.id);
            }

            localStorage.setItem("cartItems", JSON.stringify(cartItems));
            updateCounts();
          });

          productList.appendChild(col);
        });
      };

      // ✅ Initial load with "View All" on shop page
      if (isShopPage) {
        const firstNine = filteredProducts.slice(0, 9);
        const remaining = filteredProducts.slice(9);

        showProducts(firstNine);

        if (remaining.length > 0) {
          const viewAllWrapper = document.createElement("div");
          viewAllWrapper.className = "text-center my-4 col-12";

          const viewAllBtn = document.createElement("button");
          viewAllBtn.className = "btn btn-outline-dark view-btn";
          viewAllBtn.textContent = "View All";

          viewAllBtn.addEventListener("click", () => {
            showProducts(remaining);
            viewAllWrapper.remove(); 
            setupFilters(); // rebind filters after new products
          });

          viewAllWrapper.appendChild(viewAllBtn);
          productList.parentElement.appendChild(viewAllWrapper);
        }
      } else {
        showProducts(filteredProducts);
      }

      updateCounts();

      // Wait for product cards, then setup filters
      const observer = new MutationObserver(() => {
        if (productList.children.length > 0) {
          observer.disconnect();
          setupFilters();
        }
      });
      observer.observe(productList, { childList: true });
    })
    .catch(err => {
      console.error("❌ Error loading products:", err);
    });
});
