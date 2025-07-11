// product-details.js

document.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);
  const productId = params.get("id");

  // No ID = invalid access
  if (!productId) {
    document.getElementById("product-details").innerHTML = `<p class="text-danger">Invalid product link.</p>`;
    return;
  }

  // Fetch product from local JSON server
  fetch(`http://localhost:3000/products/${productId}`)
    .then(res => {
      if (!res.ok) throw new Error("Product not found");
      return res.json();
    })
    .then(product => {
      // Set title, price, image
      document.getElementById("product-title").textContent = product.title;
      document.getElementById("product-price").textContent = `$${product.price.toFixed(2)}`;
      document.getElementById("main-image").src = product.image;
      document.getElementById("main-image").alt = product.title;

      // Populate thumbnails
      const thumbnails = document.getElementById("thumbnail-images");
      thumbnails.innerHTML = "";

      if (Array.isArray(product.imageArray) && product.imageArray.length > 0) {
        product.imageArray.forEach(img => {
          const thumb = document.createElement("img");
          thumb.src = img.url;
          thumb.alt = "Thumbnail";
          thumb.className = "img-thumbnail me-2";
          thumb.style.width = "60px";
          thumb.style.cursor = "pointer";

          thumb.addEventListener("click", () => {
            document.getElementById("main-image").src = img.url;
          });

          thumbnails.appendChild(thumb);
        });
      } else {
        thumbnails.innerHTML = "<p>No additional images available.</p>";
      }

      // Optional: Add description, rating, etc.
      if (product.description) {
        document.getElementById("product-description").textContent = product.description;
      }

    })
    .catch(err => {
      console.error("Failed to load product", err);
      document.getElementById("product-details").innerHTML = `<p class="text-danger">Product not found.</p>`;
    });
});
