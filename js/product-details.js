// product-details.js
document.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);
  const productId = params.get("id");

  if (productId) {
    fetch(`http://localhost:3000/products/${productId}`)
      .then(res => res.json())
      .then(product => {
        document.getElementById("product-title").textContent = product.title;
        document.getElementById("product-price").textContent = `$${product.price.toFixed(2)}`;
        document.getElementById("main-image").src = product.image;

        const thumbnails = document.getElementById("thumbnail-images");
        thumbnails.innerHTML = "";

        product.imageArray.forEach(img => {
          const imgEl = document.createElement("img");
          imgEl.src = img.url;
          imgEl.className = "img-thumbnail me-2";
          imgEl.style.width = "60px";
          imgEl.style.cursor = "pointer";

          imgEl.addEventListener("click", () => {
            document.getElementById("main-image").src = img.url;
          });

          thumbnails.appendChild(imgEl);
        });
      })
      .catch(err => {
        console.error("Failed to load product", err);
      });
  }
});
