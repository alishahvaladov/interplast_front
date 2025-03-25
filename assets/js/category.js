// Category Page JavaScript

document.addEventListener("DOMContentLoaded", function () {
  // Get the category ID from the URL query parameter
  const params = new URLSearchParams(window.location.search);
  const categoryId = params.get("id");

  if (categoryId) {
    // Fetch the category details
    fetchCategoryDetails(categoryId);
    // Fetch products for this category
    fetchProductsByCategory(categoryId);
  } else {
    // No category ID provided, show error
    showError("Kateqoriya tapılmadı");
  }
});

/**
 * Fetch category details from the API
 * @param {string} categoryId - The ID of the category to fetch
 */
function fetchCategoryDetails(categoryId) {
  fetch(`https://api.interplast-a.com/api/categories/${categoryId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      // Extract category from the specific response format
      // Format: {success: true, message: "...", data: {category: {...}}}
      let category;
      if (data.success && data.data && data.data.category) {
        category = data.data.category;
      } else if (data.category) {
        category = data.category;
      } else if (data.data && data.data.category) {
        category = data.data.category;
      } else {
        category = data;
      }

      updateCategoryHeader(category);
    })
    .catch((error) => {
      console.error("Error fetching category details:", error);
      showError("Kateqoriya məlumatları yüklənərkən xəta baş verdi.");
    });
}

/**
 * Fetch products by category from the API
 * @param {string} categoryId - The ID of the category to fetch products for
 */
function fetchProductsByCategory(categoryId) {
  fetch(`https://api.interplast-a.com/api/product/category/${categoryId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      // Handle specific response format:
      // {success: true, message: "...", data: {products: [...]}}
      let products = [];

      if (data.success && data.data && data.data.products) {
        // Format matches exactly the provided example
        products = data.data.products;
      } else if (data.products && Array.isArray(data.products)) {
        products = data.products;
      } else if (Array.isArray(data)) {
        products = data;
      } else if (data.data && Array.isArray(data.data)) {
        products = data.data;
      } else {
        console.error("Unexpected API response structure:", data);
      }

      // Render the products
      renderProducts(products);
    })
    .catch((error) => {
      console.error("Error fetching products for category:", error);
      showError("Məhsulları yükləmək mümkün olmadı");
    });
}

/**
 * Update the category header with title, description, and image
 * @param {object} category - The category data
 */
function updateCategoryHeader(category) {
  // Use proper CSS selector escape for h-[500px]
  const headerContainer = document.querySelector(".relative.h-\\[500px\\]");
  if (!headerContainer) {
    console.error("Header container not found");
    return;
  }

  // Get elements using safer, more specific selectors
  const headerImage = headerContainer.querySelector("img");
  const headerTitle = headerContainer.querySelector("h1");
  const headerDescription = headerContainer.querySelector("p");

  if (!headerTitle) {
    console.error("Header title element not found");
    return;
  }

  // Update title
  headerTitle.textContent = category.title || "Kateqoriya";

  // Update image if available
  if (headerImage && category.image) {
    // Always use the API format for images with type=category parameter
    headerImage.src = `https://api.interplast-a.com/api/file/get?fileKey=${category.image}&type=category`;
    headerImage.alt = category.title || "Kateqoriya";
  } else if (headerImage) {
    // Use a reliable placeholder service or a local image
    headerImage.src = "./assets/img/placeholder.jpg";
    headerImage.alt = "Default Category Image";
  }

  if (headerDescription) {
    headerDescription.textContent = category.description || "";
  }
}

/**
 * Render products in the category page
 * @param {Array} products - The array of products to render
 */
function renderProducts(products) {
  const container = document.querySelector(".grid");
  if (!container) return;

  container.innerHTML = products
    .map((product) => {
      const images = getProductImageUrls(product);
      return `
        <div class="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow group cursor-pointer">
          <div class="relative h-[300px] overflow-hidden">
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
  document.querySelectorAll(".grid > div").forEach((productEl) => {
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
 * Initialize sliders on product cards
 */
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

/**
 * Show product details in a modal
 * @param {object} product - The product data
 */
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
        </div>
      </div>
    </div>
  `;

  // Add modal to the DOM
  document.body.appendChild(modal);

  // Close modal when clicking outside or on close button
  modal.addEventListener("click", function (e) {
    if (e.target === modal || e.target.closest(".close-modal")) {
      modal.remove();
    }
  });

  // Initialize the slider if needed
  if (images.length > 1) {
    const detailSlider = modal.querySelector(".product-detail-slider");
    const slides = detailSlider.querySelectorAll(".product-slide");
    const dots = detailSlider.querySelectorAll("[data-slide-index]");
    const prevBtn = detailSlider.querySelector(".prev-slide");
    const nextBtn = detailSlider.querySelector(".next-slide");

    let currentIndex = 0;

    const showSlide = (index) => {
      slides.forEach((slide) => {
        slide.classList.remove("opacity-100");
        slide.classList.add("opacity-0");
      });

      slides[index].classList.remove("opacity-0");
      slides[index].classList.add("opacity-100");

      dots.forEach((dot) => {
        dot.classList.remove("bg-opacity-100", "w-4");
        dot.classList.add("w-3");
      });

      dots[index].classList.add("bg-opacity-100", "w-4");
    };

    prevBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      currentIndex = (currentIndex - 1 + slides.length) % slides.length;
      showSlide(currentIndex);
    });

    nextBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      currentIndex = (currentIndex + 1) % slides.length;
      showSlide(currentIndex);
    });

    dots.forEach((dot, index) => {
      dot.addEventListener("click", (e) => {
        e.stopPropagation();
        currentIndex = index;
        showSlide(currentIndex);
      });
    });
  }
}

/**
 * Show an error message
 * @param {string} message - The error message to display
 */
function showError(message) {
  const container = document.querySelector(".max-w-7xl");
  if (container) {
    container.innerHTML = `
      <div class="bg-red-50 border border-red-200 rounded-lg p-6 my-8">
        <p class="text-red-600 text-center">${message}</p>
      </div>
    `;
  }
}
