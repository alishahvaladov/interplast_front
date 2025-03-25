function renderProducts(products) {
  const container = document.getElementById("productContainer");
  if (!container) return;

  container.innerHTML = products
    .map((product) => {
      const images = getProductImageUrls(product);
      return `
        <div class="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow group cursor-pointer">
          <div class="aspect-[6/5] relative overflow-hidden">
            ${
              images.length > 1
                ? `
              <div class="product-card-slider relative h-full overflow-hidden group">
                ${images
                  .map(
                    (img, index) => `
                  <div class="product-slide absolute inset-0 transition-opacity duration-300 ${
                    index === 0 ? "opacity-100 z-10" : "opacity-0 z-0"
                  }" data-index="${index}">
                    <img src="${img}" alt="${
                      product.name || product.title || "Product"
                    }" class="w-full h-full object-cover transition-transform duration-300 transform group-hover:scale-110">
                  </div>
                `
                  )
                  .join("")}
                <div class="absolute bottom-2 left-0 right-0 flex justify-center space-x-1 z-20">
                  ${images
                    .map(
                      (_, index) => `
                    <button class="w-2 h-2 rounded-full bg-white bg-opacity-60 hover:bg-opacity-100 transition-all ${
                      index === 0 ? "bg-opacity-100" : ""
                    }" data-card-slide-index="${index}"></button>
                  `
                    )
                    .join("")}
                </div>
                <button class="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-50 hover:bg-opacity-80 rounded-full p-1 text-gray-800 card-prev-slide z-20">
                  <i class="ri-arrow-left-s-line"></i>
                </button>
                <button class="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-50 hover:bg-opacity-80 rounded-full p-1 text-gray-800 card-next-slide z-20">
                  <i class="ri-arrow-right-s-line"></i>
                </button>
              </div>
              `
                : `<div class="w-full h-full overflow-hidden group">
                    <img src="${images[0]}" alt="${
                    product.name || product.title || "Product"
                  }" class="w-full h-full object-cover transition-transform duration-300 transform group-hover:scale-110">
                   </div>`
            }
          </div>
          <div class="p-6">
            <h3 class="text-xl font-semibold mb-3">${
              product.name || product.title || "Product"
            }</h3>
            <p class="text-gray-600">${product.description || ""}</p>
          </div>
        </div>
      `;
    })
    .join("");

  // Add click event to all products
  document.querySelectorAll("#productContainer > div").forEach((productEl) => {
    productEl.addEventListener("click", function (e) {
      // Don't trigger modal if clicking slider controls
      if (
        e.target.closest(".card-prev-slide") ||
        e.target.closest(".card-next-slide") ||
        e.target.hasAttribute("data-card-slide-index")
      ) {
        e.stopPropagation();
        return;
      }

      // Find the index of this product
      const index = Array.from(container.children).indexOf(this);
      if (index !== -1 && products[index]) {
        showProductDetails(products[index]);
      }
    });
  });

  // Initialize product card sliders
  initProductCardSliders();
}

/**
 * Get all possible image URLs for a product
 * @param {object} product - The product data
 * @returns {array} - Array of image URLs
 */
function getProductImageUrls(product) {
  const images = [];

  // Handle the exact structure from the API response
  // Product structure: product.image is an array of {url, default, _id} objects
  if (product.category && product.category.categoryId) {
    product.categoryId = product.category.categoryId._id;
    product.categoryName = product.category.categoryId.title;
  }

  // Handle the exact image array structure:
  // image: [{url: "img2.jpg-0B1945ED.jpg", default: true, _id: "..."}, ...]
  if (product.image && Array.isArray(product.image)) {
    product.image.forEach((img) => {
      if (img && img.url) {
        images.push(
          `https://api.interplast-a.com/api/file/get?fileKey=${img.url}`
        );
      }
    });
  }
  // Fallback for single image string or object
  else if (product.image) {
    if (typeof product.image === "string") {
      images.push(
        `https://api.interplast-a.com/api/file/get?fileKey=${product.image}`
      );
    } else if (product.image.url) {
      images.push(
        `https://api.interplast-a.com/api/file/get?fileKey=${product.image.url}`
      );
    }
  }

  // Default image if no images found
  if (images.length === 0) {
    images.push(
      `https://api.interplast-a.com/api/file/get?fileKey=default-product.jpg`
    );
  }

  return images;
}

/**
 * Helper function to get a single product image URL (for backward compatibility)
 * @param {object} product - The product data
 * @returns {string} The first image URL for the product
 */
function getProductImageUrl(product) {
  return getProductImageUrls(product)[0];
}

// Function to show product details in a modal
function showProductDetails(product) {
  // Create modal HTML
  const modal = document.createElement("div");
  modal.className =
    "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50";

  // Get all product images
  const images = getProductImageUrls(product);

  // Create the images HTML - if multiple images, create a slider
  let imagesHtml = "";

  if (images.length === 1) {
    // Just one image, no need for a slider
    imagesHtml = `
      <div class="md:w-1/2 h-[400px] md:h-[500px] flex items-center justify-center bg-white">
        <img src="${images[0]}" alt="${
      product.name || product.title || "Product"
    }" class="max-w-full max-h-full object-contain">
      </div>
    `;
  } else {
    // Multiple images, create a slider
    imagesHtml = `
      <div class="md:w-1/2 h-[400px] md:h-[500px] relative product-detail-slider bg-white">
        <div class="product-slider-container h-full relative">
          ${images
            .map(
              (img, index) => `
            <div class="product-slide absolute inset-0 transition-opacity duration-500 ${
              index === 0 ? "opacity-100" : "opacity-0"
            }" data-index="${index}">
              <div class="h-full flex items-center justify-center">
                <img src="${img}" alt="${
                product.name || product.title || "Product"
              } image ${
                index + 1
              }" class="max-w-full max-h-full object-contain">
              </div>
            </div>
          `
            )
            .join("")}
        </div>
        
        ${
          images.length > 1
            ? `
          <div class="absolute bottom-4 left-0 right-0 flex justify-center space-x-2 z-10">
            ${images
              .map(
                (_, index) => `
              <button class="w-3 h-3 rounded-full bg-white bg-opacity-60 hover:bg-opacity-100 transition-all ${
                index === 0 ? "bg-opacity-100 w-4" : ""
              }" 
                    data-slide-index="${index}"></button>
            `
              )
              .join("")}
          </div>
          
          <button class="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-50 hover:bg-opacity-80 rounded-full p-2 text-gray-800 prev-slide">
            <i class="ri-arrow-left-s-line text-xl"></i>
          </button>
          
          <button class="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-50 hover:bg-opacity-80 rounded-full p-2 text-gray-800 next-slide">
            <i class="ri-arrow-right-s-line text-xl"></i>
          </button>
        `
            : ""
        }
      </div>
    `;
  }

  // Create modal content
  modal.innerHTML = `
    <div class="bg-white rounded-lg max-w-7xl w-[90%] overflow-hidden">
      <div class="flex flex-col md:flex-row">
        ${imagesHtml}
        <div class="p-8 md:w-1/2">
          <div class="flex justify-between items-start">
            <h2 class="text-3xl font-bold">${
              product.name || product.title || "Product"
            }</h2>
            <button class="p-3 hover:bg-gray-100 rounded-full close-modal">
              <i class="ri-close-line text-2xl"></i>
            </button>
          </div>
          <p class="mt-6 text-gray-600 text-lg leading-relaxed">${
            product.description || ""
          }</p>
          ${
            product.features
              ? `
            <div class="mt-6">
              <h3 class="text-lg font-medium mb-2">Xüsusiyyətlər</h3>
              <ul class="space-y-2">
                ${
                  Array.isArray(product.features)
                    ? product.features
                        .map(
                          (feature) => `
                  <li class="flex items-center gap-2">
                    <i class="ri-check-line text-green-500"></i>
                    <span>${feature}</span>
                  </li>
                `
                        )
                        .join("")
                    : ""
                }
              </ul>
            </div>
          `
              : ""
          }
          ${
            product.categoryName
              ? `
            <div class="mt-6">
              <span class="inline-block bg-gray-100 rounded-full px-3 py-1 text-xs font-semibold text-gray-700">
                ${product.categoryName}
              </span>
            </div>
          `
              : ""
          }
        </div>
      </div>
    </div>
  `;

  // Add modal to the DOM
  document.body.appendChild(modal);

  // Handle click outside to close the modal
  modal.addEventListener("click", function (e) {
    if (e.target === modal || e.target.closest(".close-modal")) {
      modal.remove();
    }
  });

  // Initialize slider if needed
  if (images.length > 1) {
    const detailSlider = modal.querySelector(".product-detail-slider");
    const slides = detailSlider.querySelectorAll(".product-slide");
    const indicators = detailSlider.querySelectorAll("[data-slide-index]");
    const prevBtn = detailSlider.querySelector(".prev-slide");
    const nextBtn = detailSlider.querySelector(".next-slide");

    let currentIndex = 0;

    // Function to change slide
    const goToSlide = (index) => {
      // Hide all slides
      slides.forEach((slide) => {
        slide.classList.remove("opacity-100");
        slide.classList.add("opacity-0");
      });

      // Show the selected slide
      slides[index].classList.remove("opacity-0");
      slides[index].classList.add("opacity-100");

      // Update indicators
      indicators.forEach((dot, i) => {
        if (i === index) {
          dot.classList.add("bg-opacity-100", "w-4");
        } else {
          dot.classList.remove("bg-opacity-100", "w-4");
        }
      });

      currentIndex = index;
    };

    // Set up indicator click events
    indicators.forEach((dot) => {
      dot.addEventListener("click", () => {
        const slideIndex = parseInt(dot.getAttribute("data-slide-index"));
        goToSlide(slideIndex);
      });
    });

    // Set up previous/next buttons
    if (prevBtn) {
      prevBtn.addEventListener("click", (e) => {
        e.stopPropagation(); // Prevent event bubbling
        let newIndex = currentIndex - 1;
        if (newIndex < 0) newIndex = slides.length - 1;
        goToSlide(newIndex);
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener("click", (e) => {
        e.stopPropagation(); // Prevent event bubbling
        let newIndex = currentIndex + 1;
        if (newIndex >= slides.length) newIndex = 0;
        goToSlide(newIndex);
      });
    }

    // Handle keyboard navigation
    const handleKeyDown = (e) => {
      if (e.key === "ArrowLeft") {
        let newIndex = currentIndex - 1;
        if (newIndex < 0) newIndex = slides.length - 1;
        goToSlide(newIndex);
      } else if (e.key === "ArrowRight") {
        let newIndex = currentIndex + 1;
        if (newIndex >= slides.length) newIndex = 0;
        goToSlide(newIndex);
      } else if (e.key === "Escape") {
        modal.remove();
        document.removeEventListener("keydown", handleKeyDown);
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    // Remove event listener when modal is closed
    modal.addEventListener("click", () => {
      document.removeEventListener("keydown", handleKeyDown);
    });
  }
}

// Function to initialize sliders on product cards
function initProductCardSliders() {
  document.querySelectorAll(".product-card-slider").forEach((slider) => {
    const slides = slider.querySelectorAll(".product-slide");
    const dots = slider.querySelectorAll("[data-card-slide-index]");
    const prevBtn = slider.querySelector(".card-prev-slide");
    const nextBtn = slider.querySelector(".card-next-slide");

    if (slides.length <= 1) return;

    let currentIndex = 0;

    const showSlide = (index) => {
      // Hide all slides
      slides.forEach((slide) => {
        slide.classList.remove("opacity-100", "z-10");
        slide.classList.add("opacity-0", "z-0");
      });

      // Show the target slide
      slides[index].classList.remove("opacity-0", "z-0");
      slides[index].classList.add("opacity-100", "z-10");

      // Update dots
      dots.forEach((dot) => dot.classList.remove("bg-opacity-100"));
      dots[index].classList.add("bg-opacity-100");
    };

    if (prevBtn) {
      prevBtn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        currentIndex = (currentIndex - 1 + slides.length) % slides.length;
        showSlide(currentIndex);
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        currentIndex = (currentIndex + 1) % slides.length;
        showSlide(currentIndex);
      });
    }

    dots.forEach((dot, index) => {
      dot.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        currentIndex = index;
        showSlide(currentIndex);
      });
    });
  });
}

// Function to fetch and process products
function fetchProducts() {
  fetch("https://api.interplast-a.com/api/product/all", {
    method: "GET",
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    })
    .then((responseData) => {
      // Handle different possible response structures
      let data;
      if (responseData.products && Array.isArray(responseData.products)) {
        data = responseData.products;
      } else if (Array.isArray(responseData)) {
        data = responseData;
      } else if (responseData.data && Array.isArray(responseData.data)) {
        data = responseData.data;
      } else {
        console.error("Unexpected API response structure:", responseData);
        data = [];
      }

      // If no products returned from API, use mock data as fallback
      if (data.length === 0) {
        data = [];
      }

      // Process products with category information if available
      const processedProducts = data.map((product) => {
        // If product has category information
        if (product.category) {
          // If category is an object with _id
          if (typeof product.category === "object" && product.category._id) {
            product.categoryId = product.category._id;
            product.categoryName =
              product.category.title || product.category.name;
          }
          // If category is a string ID
          else if (typeof product.category === "string") {
            product.categoryId = product.category;
          }
        }

        return product;
      });

      // Render all products
      renderProducts(processedProducts);
    })
    .catch((error) => {
      console.error("Error fetching products:", error);
      // Show error message in the product container
      const container = document.getElementById("productContainer");
      if (container) {
        container.innerHTML = `<div class="col-span-full text-center p-4">
          <p class="text-red-500">Məhsulları yükləyərkən xəta baş verdi. Zəhmət olmasa, bir az sonra yenidən cəhd edin.</p>
        </div>`;
      }
    });
}

// Initialize products on page load
document.addEventListener("DOMContentLoaded", function () {
  fetchProducts();
});
