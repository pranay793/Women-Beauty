document.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);
  const productId = params.get("id");

  if (!productId) return;

  fetch(`http://localhost:3000/products/${productId}`)
    .then(res => res.json())
    .then(product => {
      const productPriceEl = document.getElementById("product-price");
      const basePrice = product.price;
      productPriceEl.textContent = `$${basePrice.toFixed(2)}`;
      document.getElementById("product-title").textContent = product.title;
      document.getElementById("main-image").src = product.image;

      // ⭐ Render star rating
      const ratingContainer = document.getElementById("product-rating");
      if (ratingContainer && product.rating !== undefined) {
        const fullStars = Math.floor(product.rating);
        const halfStar = product.rating % 1 >= 0.5 ? 1 : 0;
        const emptyStars = 5 - fullStars - halfStar;

        let starsHTML = "";

        for (let i = 0; i < fullStars; i++) {
          starsHTML += `<i class="fas fa-star text-warning me-1"></i>`;
        }

        if (halfStar) {
          starsHTML += `<i class="fas fa-star-half-alt text-warning me-1"></i>`;
        }

        for (let i = 0; i < emptyStars; i++) {
          starsHTML += `<i class="far fa-star text-warning me-1"></i>`;
        }

        ratingContainer.innerHTML = starsHTML;
      }

      // Render thumbnails with border + active on click
      const thumbnailContainer = document.getElementById("thumbnail-images");
      if (thumbnailContainer && Array.isArray(product.imageArray)) {
        thumbnailContainer.innerHTML = "";

        product.imageArray.forEach((imageObj, index) => {
          const thumb = document.createElement("img");
          thumb.src = imageObj.url;
          thumb.alt = "Thumbnail";
          thumb.className = "thumbnail-images";
          thumb.style.width = "80px";
          thumb.style.marginRight = "10px";

          if (index === 0) thumb.classList.add("active");

          thumb.addEventListener("click", () => {
            document.getElementById("main-image").src = imageObj.url;

            const allThumbs = document.querySelectorAll(".thumbnail-images");
            allThumbs.forEach(t => t.classList.remove("active"));

            thumb.classList.add("active");
          });

          thumbnailContainer.appendChild(thumb);
        });
      }

      // Quantity logic
      const quantityInput = document.getElementById("quantity");
      quantityInput.value = 1;

      quantityInput.addEventListener("input", () => {
        const qty = parseInt(quantityInput.value) || 1;
        const total = basePrice * qty;
        productPriceEl.textContent = `$${total.toFixed(2)}`;
      });

      // Add to Cart
      document.querySelector(".add-to-cart").addEventListener("click", () => {
        const qty = parseInt(quantityInput.value) || 1;
        addToCart(product, qty);
        localStorage.removeItem("buyNowItem");
        window.location.href = "cart.html";
      });

      // Buy Now
      document.querySelector(".buy-now").addEventListener("click", () => {
        const qty = parseInt(quantityInput.value) || 1;

        const buyNowProduct = {
          id: product.id.toString(),
          name: product.title,
          image: product.image,
          price: product.price,
          quantity: qty
        };

        localStorage.setItem("buyNowItem", JSON.stringify(buyNowProduct));
        window.location.href = "checkout.html";
      });

      // Show customer view count and sold count
      const customerCountEl = document.getElementById("customer-view-count");
      const soldCountEl = document.getElementById("sold-count");

      if (customerCountEl && soldCountEl) {
        customerCountEl.textContent = `${product.custshow || 0} Customers`;
        soldCountEl.textContent = `${product.soldpro || 0} Sold`;
      }

      // === Description Section ===
      const descWrapper = document.getElementById("product-description-section");

      if (descWrapper) {
        let descHTML = `
          <h5 class="fw-bold mb-3">Description</h5>
          ${Array.isArray(product.description)
            ? product.description.map(p => `<p class="text-muted mb-3">${p}</p>`).join("")
            : `<p class="text-muted mb-3">${product.description || ""}</p>`}
          
          <h6 class="fw-bold mb-3">Why Choose Us?</h6>
          <p class="text-muted mb-3">${product.whyChooseUs || ""}</p>

          <h6 class="fw-bold mb-3">Sustainability & Care</h6>
          <p class="text-muted">${product.sustainabilityCare || ""}</p>
        `;
        descWrapper.innerHTML = descHTML;
      }

      // === Reviews Section ===
      const reviewsWrapper = document.getElementById("product-reviews-section");

      if (reviewsWrapper && Array.isArray(product.reviews)) {
        let reviewsHTML = product.reviews.map(review => {
          const fullStars = Math.floor(review.rating);
          const halfStar = review.rating % 1 >= 0.5 ? 1 : 0;
          const emptyStars = 5 - fullStars - halfStar;

          let starsHTML = "";

          for (let i = 0; i < fullStars; i++) {
            starsHTML += `<i class="fas fa-star text-warning me-1"></i>`;
          }
          if (halfStar) {
            starsHTML += `<i class="fas fa-star-half-alt text-warning me-1"></i>`;
          }
          for (let i = 0; i < emptyStars; i++) {
            starsHTML += `<i class="far fa-star text-warning me-1"></i>`;
          }

          return `
            <div class="review-item border-bottom pb-4 mb-4 d-flex flex-wrap align-items-start justify-content-between">
              <div class="d-flex">
                <img src="${review.image}" alt="${review.name}" class="rounded-circle me-3" width="60" height="60">
                <div class="user-name">
                  <h6 class="mb-0 fw-bold">${review.name}</h6>
                  <small class="text-muted">${review.platform}</small>
                </div>
              </div>
              <div class="ms-5 flex-grow-1">
                <div class="d-flex flex-wrap justify-content-between align-items-center mt-3 mt-md-0">
                  <div class="text-warning mb-2">
                    ${starsHTML}
                    <span class="fw-bold text-dark ms-2">${review.title}</span>
                  </div>
                  <small class="text-muted">${review.date}</small>
                </div>
                <p class="fst-italic text-muted mt-2 mb-0">“${review.comment}”</p>
              </div>
            </div>
          `;
        }).join("");

        reviewsWrapper.innerHTML = reviewsHTML;
      }

      // === Add to Cart Logic ===
      function addToCart(product, quantity) {
        let cartItems = JSON.parse(localStorage.getItem("cartItems")) || [];
        const id = product.id.toString();
        const existingItem = cartItems.find(item => item.id === id);

        if (existingItem) {
          existingItem.quantity += quantity;
        } else {
          cartItems.push({
            id: id,
            name: product.title,
            image: product.image,
            price: product.price,
            quantity: quantity
          });
        }

        localStorage.setItem("cartItems", JSON.stringify(cartItems));
      }
    })
    .catch(error => {
      console.error("Failed to load product:", error);
      alert("Product not found.");
    });
});
