// ✅ header-count.js — load this on every page that includes header
document.addEventListener("DOMContentLoaded", () => {
  const cartCountEl = document.getElementById("cart-count");
  const wishlistCountEl = document.getElementById("wishlist-count");

  // ⏫ Custom event emit helper
  function dispatchHeaderUpdateEvents() {
    window.dispatchEvent(new Event("cartUpdated"));
    window.dispatchEvent(new Event("wishlistUpdated"));
  }

  // ⏫ Patch localStorage.setItem to dispatch events when cart/wishlist changes
  const originalSetItem = localStorage.setItem;
  localStorage.setItem = function (key, value) {
    originalSetItem.apply(this, arguments);
    if (key === "cartItems") {
      window.dispatchEvent(new Event("cartUpdated"));
    } else if (key === "wishlistItems") {
      window.dispatchEvent(new Event("wishlistUpdated"));
    }
  };

  function updateCounts() {
    let cartItems = JSON.parse(localStorage.getItem("cartItems")) || [];
    let wishlistItems = JSON.parse(localStorage.getItem("wishlistItems")) || [];

    // Handle malformed data
    if (!Array.isArray(cartItems)) cartItems = [];
    if (!Array.isArray(wishlistItems)) wishlistItems = [];

    const totalQty = cartItems.reduce((sum, item) => {
      if (item && typeof item === "object" && "quantity" in item) {
        return sum + (parseInt(item.quantity) || 1);
      }
      return sum + 1;
    }, 0);

    if (cartCountEl) {
      cartCountEl.textContent = totalQty;
      cartCountEl.classList.toggle("d-none", totalQty === 0);
    }

    if (wishlistCountEl) {
      wishlistCountEl.textContent = wishlistItems.length;
      wishlistCountEl.classList.toggle("d-none", wishlistItems.length === 0);
    }
  }

  // ✅ Initial load
  updateCounts();

  // ✅ Realtime update using global events
  window.addEventListener("cartUpdated", updateCounts);
  window.addEventListener("wishlistUpdated", updateCounts);

  // ✅ Expose to global scope for manual use
  window.updateHeaderCounts = updateCounts;
  window.dispatchHeaderUpdateEvents = dispatchHeaderUpdateEvents;
});
