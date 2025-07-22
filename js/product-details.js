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

            // Remove active from all thumbnails
            const allThumbs = document.querySelectorAll(".thumbnail-images");
            allThumbs.forEach(t => t.classList.remove("active"));

            // Add active to clicked one
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
        productPriceEl.textContent = `₹${total.toFixed(2)}`;
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

      // Function to add to cart
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
