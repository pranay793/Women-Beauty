document.addEventListener("DOMContentLoaded", () => {
  const productList = document.getElementById("product-list");
  const filterPanel = document.getElementById("filter-panel");
  const brandFilterEl = document.getElementById("brand-filter-container");

  const priceRange = document.getElementById("price-range");
  const priceMax = document.getElementById("price-max");
  const priceRangeLabel = document.getElementById("price-range-value");

  // ✅ Always get the current visible product cards
  function getCurrentCards() {
    return [...productList.querySelectorAll(".col-6, .col-md-4, .col-md-3")];
  }

  // ✅ Setup filters after products are rendered
  window.setupFilters = function () {
    const cards = getCurrentCards();

    // Populate all brands from global allProducts
    const brandSet = new Set();
    allProducts.forEach(p => {
      const brand = p.brand || p.title.split(" ")[0];
      brandSet.add(brand);
    });

    brandFilterEl.innerHTML = [...brandSet].sort().map(brand => `
      <label class="d-block">
        <input type="checkbox" class="filter-brand" value="${brand}"> ${brand}
      </label>
    `).join("");

    // Assign data attributes to cards
    cards.forEach(card => {
      const id = parseInt(card.getAttribute("data-id"));
      const product = allProducts.find(p => p.id === id);
      if (!product) return;

      const brand = product.brand || product.title.split(" ")[0];
      const availability = product.Availability || (product.id === 5 ? "Out of Stock" : "In Stock");

      card.setAttribute("data-brand", brand);
      card.setAttribute("data-availability", availability);
      card.setAttribute("data-price", product.price);
    });

    filterPanel.addEventListener("input", applyFilters);
    filterPanel.addEventListener("change", applyFilters);

    setupPriceSlider(allProducts);
  };

  // ✅ Setup single price slider (max only)
  function setupPriceSlider(products) {
    const prices = products.map(p => p.price);
    const minPriceVal = Math.floor(Math.min(...prices));
    const maxPriceVal = Math.ceil(Math.max(...prices));

    priceRange.min = minPriceVal;
    priceRange.max = maxPriceVal;
    priceRange.value = maxPriceVal;
    priceMax.value = maxPriceVal;
    priceRangeLabel.textContent = `₹${maxPriceVal}`;

    priceRange.addEventListener("input", () => {
      const val = parseFloat(priceRange.value);
      priceMax.value = val;
      priceRangeLabel.textContent = `₹${val}`;
      applyFilters();
    });
  }

  // ✅ Apply availability, brand, and max price filters
  function applyFilters() {
    const cards = getCurrentCards();

    const selectedAvailability = [...document.querySelectorAll(".filter-availability:checked")].map(el => el.value);
    const selectedBrands = [...document.querySelectorAll(".filter-brand:checked")].map(el => el.value);
    const maxPrice = parseFloat(priceMax.value) || Number.MAX_SAFE_INTEGER;

    cards.forEach(card => {
      const price = parseFloat(card.getAttribute("data-price")) || 0;
      const availability = card.getAttribute("data-availability") || "In Stock";
      const brand = card.getAttribute("data-brand") || "";

      let visible = true;

      if (selectedAvailability.length && !selectedAvailability.includes(availability)) visible = false;
      if (selectedBrands.length && !selectedBrands.includes(brand)) visible = false;
      if (price > maxPrice) visible = false;

      card.style.display = visible ? "" : "none";
    });
  }

  // ✅ Wait until products are rendered from custom.js
  const observer = new MutationObserver(() => {
    if (productList.children.length > 0) {
      observer.disconnect();
      setupFilters();
    }
  });
  observer.observe(productList, { childList: true });
});
