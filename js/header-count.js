// header-count.js — must be loaded on cart.html or static pages
document.addEventListener("DOMContentLoaded", () => {
  const cartCountEl = document.getElementById("cart-count");
  const wishlistCountEl = document.getElementById("wishlist-count");

  let cartItems = JSON.parse(localStorage.getItem("cartItems")) || [];
  let wishlistItems = JSON.parse(localStorage.getItem("wishlistItems")) || [];

  // Cleanup malformed data
  if (!Array.isArray(cartItems)) {
    cartItems = [];
    localStorage.removeItem("cartItems");
  }

  const totalCartQty = cartItems.reduce((sum, item) => sum + (parseInt(item.quantity) || 0), 0);

  if (cartCountEl) {
    cartCountEl.textContent = totalCartQty;
    if (totalCartQty > 0) {
      cartCountEl.classList.remove("d-none");
    } else {
      cartCountEl.classList.add("d-none");
    }
  }

  if (wishlistCountEl) {
    wishlistCountEl.textContent = wishlistItems.length;
    if (wishlistItems.length > 0) {
      wishlistCountEl.classList.remove("d-none");
    } else {
      wishlistCountEl.classList.add("d-none");
    }
  }
});
