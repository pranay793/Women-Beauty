document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("header-container");
  if (!container) return;

  container.innerHTML = `
    <!-- Your existing header HTML -->
    <div class="top-bar text-dark py-1 small">
      <div class="container">
        <div class="row text-center text-md-start align-items-center">
          <div class="col-md-3 d-none d-md-block"></div>
          <div class="col-12 col-md-6">
            <span class="d-block text-center">
              Get up to 35% off + Free shipping <a href="#" class="text-dark fw-semibold text-decoration-underline">Shop Now</a>
            </span>
          </div>
          <div class="col-md-3 d-none d-md-flex justify-content-end gap-3 align-items-center">
            <i class="fas fa-phone-alt"></i> +880-345-6789
            <i class="fas fa-store"></i> Store
          </div>
        </div>
      </div>
    </div>

    <header class="py-2 border-bottom">
      <div class="container">
        <nav class="navbar navbar-expand-lg navbar-light bg-white">
          <a class="navbar-brand fw-bold fs-3" href="index.html"><img src="images/logo.png" alt="Logo"/></a>
          <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
            <span class="navbar-toggler-icon"></span>
          </button>
          <div class="collapse navbar-collapse justify-content-between" id="navbarNav">
            <ul class="navbar-nav mx-auto">
              <li class="nav-item"><a class="nav-link" href="index.html">HOME</a></li>
              <li class="nav-item"><a class="nav-link" href="#">ABOUT US</a></li>
              <li class="nav-item"><a class="nav-link" href="shop.html">SHOP</a></li>
              <li class="nav-item"><a class="nav-link" href="#">BLOG</a></li>
              <li class="nav-item"><a class="nav-link" href="#">CONTACT US</a></li>
            </ul>
            <div class="d-flex align-items-center gap-3">
              <a href="#" class="text-dark"><i class="fas fa-search"></i></a>
              <a href="cart.html" class="text-dark position-relative">
                <i class="fas fa-shopping-cart"></i>
                <span id="cart-count" class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger d-none">0</span>
              </a>
              <a href="wishlist.html" class="text-dark position-relative">
                <i class="fas fa-heart"></i>
                <span id="wishlist-count" class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger d-none">0</span>
              </a>
            </div>
          </div>
        </nav>
      </div>
    </header>
  `;

  // ✅ Wait for DOM to update, then run count logic
  setTimeout(() => {
    const wishlistCountEl = document.getElementById("wishlist-count");
    const cartCountEl = document.getElementById("cart-count");

    // ✅ Parse localStorage items and sanitize
    let wishlistItems = JSON.parse(localStorage.getItem("wishlistItems")) || [];
    let cartItems = JSON.parse(localStorage.getItem("cartItems")) || [];

    if (!Array.isArray(wishlistItems)) {
      wishlistItems = [];
      localStorage.setItem("wishlistItems", JSON.stringify([]));
    }

    if (!Array.isArray(cartItems)) {
      cartItems = [];
      localStorage.setItem("cartItems", JSON.stringify([]));
    }

    // ✅ Update wishlist count display
    if (wishlistItems.length > 0) {
      wishlistCountEl.textContent = wishlistItems.length;
      wishlistCountEl.classList.remove("d-none");
    } else {
      wishlistCountEl.textContent = "0";
      wishlistCountEl.classList.add("d-none");
    }

    // ✅ Update cart count display
    if (cartItems.length > 0) {
      cartCountEl.textContent = cartItems.length;
      cartCountEl.classList.remove("d-none");
    } else {
      cartCountEl.textContent = "0";
      cartCountEl.classList.add("d-none");
    }
  }, 100);
});