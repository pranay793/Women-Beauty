// header-count.js

document.addEventListener("DOMContentLoaded", () => {
  const cartCountEl = document.getElementById("cart-count");
  const wishlistCountEl = document.getElementById("wishlist-count");

  const cartItems = JSON.parse(localStorage.getItem("cartItems")) || [];
  const wishlistItems = JSON.parse(localStorage.getItem("wishlistItems")) || [];

  if (cartCountEl) {
    cartCountEl.textContent = cartItems.length;
  }

  if (wishlistCountEl) {
    wishlistCountEl.textContent = wishlistItems.length;
  }
});
