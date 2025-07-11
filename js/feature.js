document.addEventListener("DOMContentLoaded", () => {
    fetch("http://localhost:3000/products")
      .then(res => res.json())
      .then(products => {
        const featured = products.filter(p => p.rating >= 4);
        const carousel = document.getElementById("feature-product-carousel");
  
        featured.forEach(product => {
          const fullStars = Math.floor(product.rating);
          const halfStar = product.rating % 1 >= 0.5;
          const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
  
          const starsHTML = `
            <div class="stars mb-2">
              ${'<i class="fas fa-star"></i>'.repeat(fullStars)}
              ${halfStar ? '<i class="fas fa-star-half-alt"></i>' : ''}
              ${'<i class="far fa-star"></i>'.repeat(emptyStars)}
            </div>
          `;
  
          const isInCart = JSON.parse(localStorage.getItem("cartItems") || "[]").includes(product.id);
          const isInWishlist = JSON.parse(localStorage.getItem("wishlistItems") || "[]").includes(product.id);
  
          const box = document.createElement("div");
          box.className = "product-box px-2";
  
          box.innerHTML = `
            <div class="product-card p-3 position-relative">
              <div class="product-icons position-absolute top-0 end-0 m-2 d-flex flex-column">
                <button class="btn btn-sm rounded-circle wishlist-btn ${isInWishlist ? 'active' : ''}">
                  <i class="fas fa-heart"></i>
                </button>
                <button class="btn btn-sm rounded-circle cart-btn ${isInCart ? 'active' : ''}">
                  <i class="fas fa-shopping-cart"></i>
                </button>
              </div>
              <div class="product-box-img mb-3">
                <img src="${product.image}" alt="${product.title}" class="img-fluid">
              </div>
              </div>
              <h6 class="fw-semibold">${product.title}</h6>
              <p class="mb-1">
                <del>$${(product.price + 5).toFixed(2)}</del> 
                <span class="text-danger fw-bold">$${product.price.toFixed(2)}</span>
              </p>
              ${starsHTML}
            
          `;
  
          // Add button event listeners
          const wishlistBtn = box.querySelector(".wishlist-btn");
          const cartBtn = box.querySelector(".cart-btn");
  
          wishlistBtn.addEventListener("click", (e) => {
            e.preventDefault();
            e.stopPropagation();
  
            const wishlistItems = JSON.parse(localStorage.getItem("wishlistItems") || "[]");
            const index = wishlistItems.indexOf(product.id);
            if (index >= 0) {
              wishlistItems.splice(index, 1);
              wishlistBtn.classList.remove("active");
            } else {
              wishlistItems.push(product.id);
              wishlistBtn.classList.add("active");
            }
            localStorage.setItem("wishlistItems", JSON.stringify(wishlistItems));
          });
  
          cartBtn.addEventListener("click", (e) => {
            e.preventDefault();
            e.stopPropagation();
  
            const cartItems = JSON.parse(localStorage.getItem("cartItems") || "[]");
            const index = cartItems.indexOf(product.id);
            if (index >= 0) {
              cartItems.splice(index, 1);
              cartBtn.classList.remove("active");
            } else {
              cartItems.push(product.id);
              cartBtn.classList.add("active");
            }
            localStorage.setItem("cartItems", JSON.stringify(cartItems));
          });
  
          carousel.appendChild(box);
        });
  
        // ✅ Slick Carousel Init
        $('#feature-product-carousel').slick({
          slidesToShow: 4,
          slidesToScroll: 1,
          arrows: true,
          dots: false,
          autoplay: true,
          autoplaySpeed: 2500,
          prevArrow: `<button type="button" class="slick-prev slick-arrow"><i class="fas fa-chevron-left"></i></button>`,
          nextArrow: `<button type="button" class="slick-next slick-arrow"><i class="fas fa-chevron-right"></i></button>`,
          responsive: [
            { breakpoint: 1200, settings: { slidesToShow: 3 } },
            { breakpoint: 992, settings: { slidesToShow: 2 } },
            { breakpoint: 576, settings: { slidesToShow: 1 } }
          ]
        });
      })
      .catch(err => console.error("❌ Error loading featured products:", err));
  });
  