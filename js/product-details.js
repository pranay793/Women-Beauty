document.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);
  const productId = params.get("id");

  if (!productId) return;

  fetch(`http://localhost:3000/products/${productId}`)
    .then(res => res.json())
    .then(product => {
      const productPriceEl = document.getElementById("product-price");
      const basePrice = product.price;
      productPriceEl.textContent = `₹${basePrice.toFixed(2)}`;
      document.getElementById("product-title").textContent = product.title;
      document.getElementById("main-image").src = product.image;

      // ⭐ Star Rating
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

      // 🖼️ Thumbnails
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
            document.querySelectorAll(".thumbnail-images").forEach(t => t.classList.remove("active"));
            thumb.classList.add("active");
          });

          thumbnailContainer.appendChild(thumb);
        });
      }

      // 🔢 Quantity logic
      const quantityInput = document.getElementById("quantity");
      quantityInput.value = 1;
      quantityInput.addEventListener("input", () => {
        const qty = parseInt(quantityInput.value) || 1;
        const total = basePrice * qty;
        productPriceEl.textContent = `₹${total.toFixed(2)}`;
      });

      // 🛒 Add to Cart
      document.querySelector(".add-to-cart").addEventListener("click", () => {
        const qty = parseInt(quantityInput.value) || 1;
        addToCart(product, qty);
        localStorage.removeItem("buyNowItem");
        window.location.href = "cart.html";
      });

      // ⚡ Buy Now
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

      // 👁️ View and Sold Counts
      const customerCountEl = document.getElementById("customer-view-count");
      const soldCountEl = document.getElementById("sold-count");
      if (customerCountEl && soldCountEl) {
        customerCountEl.textContent = `${product.custshow || 0} Customers`;
        soldCountEl.textContent = `${product.soldpro || 0} Sold`;
      }

      // ✅ DESCRIPTION
      const descEl = document.getElementById("product-description");
      if (descEl && Array.isArray(product.description)) {
        descEl.innerHTML = `
          <h4>Description</h4>
          <p>${product.description.join(" ")}</p>
        `;
      }

      // ✅ WHY CHOOSE US
      const whyEl = document.getElementById("why-choose-us");
      if (whyEl && Array.isArray(product.whyChooseUs)) {
        whyEl.innerHTML = `
          <h4>Why Choose Us?</h4>
          <p>${product.whyChooseUs.join(" ")}</p>
        `;
      }

      // ✅ SUSTAINABILITY & CARE
      const sustainEl = document.getElementById("sustainability");
      if (sustainEl && product.sustainabilityCare) {
        sustainEl.innerHTML = `
          <h4>Sustainability & Care</h4>
          <p>${product.sustainabilityCare}</p>
        `;
      }

      // ✅ CUSTOMER REVIEWS
const reviewEl = document.getElementById("customer-reviews");
if (reviewEl && Array.isArray(product.reviews)) {
  let reviewsHTML = ``;
  
  product.reviews.forEach(r => {
    const fullStars = Math.floor(r.rating);
    const halfStar = r.rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);

    let starsHTML = "";
    for (let i = 0; i < fullStars; i++) {
      starsHTML += `<i class="fas fa-star text-warning"></i>`;
    }
    if (halfStar) {
      starsHTML += `<i class="fas fa-star-half-alt text-warning"></i>`;
    }
    for (let i = 0; i < emptyStars; i++) {
      starsHTML += `<i class="far fa-star text-warning"></i>`;
    }

    reviewsHTML += `
      <div class="review-block d-flex justify-content-between align-items-start py-3 border-bottom">
        <div class="d-flex w-24">
          <img src="${r.image}" alt="${r.name}" class="rounded-circle me-3" style="width: 60px; height: 60px; object-fit: cover;">
          <div>
            <strong>${r.name}</strong><br>
            <small class="text-muted">${r.platform}</small>
          </div>
        </div>
        <div class="flex-grow-1 px-3">
          <div class="mb-1">${starsHTML} <strong>${r.title}</strong></div>
          <p class="fst-italic mb-0" style="font-size: 0.95rem;">"${r.comment}"</p>
        </div>
        <div class="text-end small text-muted">${r.date}</div>
      </div>
    `;
  });

  reviewEl.innerHTML = reviewsHTML;
}


      // 🧠 Add to Cart Logic
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
