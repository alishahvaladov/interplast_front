const mockProducts = [
  {
    id: 1,
    name: "Premium Wireless Headphones",
    description:
      "Experience crystal-clear sound with our premium wireless headphones featuring active noise cancellation.",
    image:
      "https://public.readdy.ai/ai/img_res/eb26879397d85b561dddec1c25afebcb.jpg",
    category: "Electronics",
    details: {
      features: [
        "Active Noise Cancellation",
        "40-hour Battery Life",
        "Premium Sound Quality",
        "Bluetooth 5.0",
      ],
      specifications: {
        weight: "250g",
        batteryLife: "40 hours",
        chargingTime: "2 hours",
        connectivity: "Bluetooth 5.0",
        range: "10m",
      },
      price: "$299.99",
      stock: 45,
    },
  },
  {
    id: 2,
    name: "Modern Minimalist Watch",
    description:
      "Elegant timepiece with a clean design and premium materials for the modern professional.",
    image:
      "https://public.readdy.ai/ai/img_res/a34b70b9bad6d2233487c3753d6cfd26.jpg",
    category: "Fashion",
    details: {
      features: [
        "Swiss Movement",
        "Sapphire Crystal",
        "Genuine Leather Strap",
        "Water Resistant",
      ],
      specifications: {
        case: "42mm Stainless Steel",
        movement: "Swiss Automatic",
        waterResistance: "50m",
        strapWidth: "20mm",
        warranty: "2 years",
      },
      price: "$399.99",
      stock: 25,
    },
  },
  {
    id: 3,
    name: "Smart Home Hub",
    description:
      "Control your entire home with this intuitive smart hub featuring voice control and automation.",
    image:
      "https://public.readdy.ai/ai/img_res/3985f5f26e30c112f13217fdb74a9742.jpg",
    category: "Home",
    details: {
      features: [
        "Voice Control",
        "Smart Device Integration",
        "Energy Monitoring",
        "Custom Automation",
      ],
      specifications: {
        compatibility: "Alexa & Google Assistant",
        wireless: "Wi-Fi 6",
        power: "DC 5V/2A",
        dimensions: "110 x 110 x 40mm",
        connectivity: "Bluetooth 5.0, Zigbee",
      },
      price: "$199.99",
      stock: 60,
    },
  },
  {
    id: 4,
    name: "Ergonomic Office Chair",
    description:
      "Premium office chair designed for comfort during long work hours with adjustable features.",
    image:
      "https://public.readdy.ai/ai/img_res/8a311cfcd81598733a4a508c2cd63917.jpg",
    category: "Home",
    details: {
      features: [
        "Adjustable Lumbar Support",
        "4D Armrests",
        "Breathable Mesh",
        "360° Swivel",
      ],
      specifications: {
        material: "Mesh & Aluminum",
        maxWeight: "300 lbs",
        seatHeight: "17-21 inches",
        warranty: "5 years",
        assembly: "Required",
      },
      price: "$499.99",
      stock: 15,
    },
  },
  {
    id: 5,
    name: "Wireless Charging Pad",
    description:
      "Sleek charging solution for all your devices with fast charging capability.",
    image:
      "https://public.readdy.ai/ai/img_res/0c98fdac96569d4d9d7a8c3973665dc9.jpg",
    category: "Electronics",
    details: {
      features: [
        "15W Fast Charging",
        "Multi-Device Support",
        "LED Indicator",
        "Foreign Object Detection",
      ],
      specifications: {
        input: "QC 3.0/USB-C",
        output: "5W/7.5W/10W/15W",
        dimensions: "100 x 100 x 8mm",
        compatibility: "Qi-enabled devices",
        cableLength: "1.5m",
      },
      price: "$49.99",
      stock: 100,
    },
  },
  {
    id: 6,
    name: "Premium Leather Wallet",
    description:
      "Handcrafted leather wallet with RFID protection and minimal design.",
    image:
      "https://public.readdy.ai/ai/img_res/bc62ebd616f387d8e21a39b833233143.jpg",
    category: "Fashion",
    details: {
      features: [
        "RFID Protection",
        "Full-grain Leather",
        "Slim Profile",
        "Multiple Card Slots",
      ],
      specifications: {
        material: "Italian Leather",
        cardSlots: "8 slots",
        dimensions: "4.5 x 3.5 inches",
        color: "Tan Brown",
        warranty: "Lifetime",
      },
      price: "$79.99",
      stock: 35,
    },
  },
];

function renderProducts(data) {
  const container = document.getElementById("productContainer");

  if (!data || !Array.isArray(data) || data.length === 0) {
    container.innerHTML =
      '<p class="text-center p-4">No products available</p>';
    return;
  }

  container.innerHTML = data
    .map((product) => {
      // Determine the category identifier to use
      const categoryId = product.categoryId || "";
      const categoryName = product.categoryName || "";

      return `
                <div class="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow" 
                     data-category="${categoryId}" 
                     data-category-name="${categoryName}"
                     data-parent-category="${product.parentCategoryId || ""}">
                    <div class="aspect-w-4 aspect-h-3">
                        <img src="${getProductImageUrl(product)}" alt="${
        product.name || product.title || "Product"
      }" class="w-full h-64 object-cover">
                    </div>
                    <div class="p-4">
                        <h3 class="text-lg font-medium text-gray-900">${
                          product.name || product.title || "Product"
                        }</h3>
                        <p class="mt-2 text-sm text-gray-600 line-clamp-2">${
                          product.description || ""
                        }</p>
                        <div class="mt-2">
                            <span class="inline-block bg-gray-100 rounded-full px-3 py-1 text-xs font-semibold text-gray-700">
                                ${categoryName || "Uncategorized"}
                            </span>
                        </div>
                        <button onclick="showProductDetails(${JSON.stringify(
                          product
                        ).replace(
                          /"/g,
                          "&quot;"
                        )})" class="mt-4 px-4 py-2 border border-gray-200 text-gray-700 flex items-center justify-center gap-2 hover:border-primary hover:text-primary transition-colors duration-200 text-sm font-medium !rounded-button">
                        View Details
                            <i class="ri-arrow-right-up-line"></i>
                        </button>
                    </div>
                </div>
            `;
    })
    .join("");
}

// Helper function to safely get product image URL
function getProductImageUrl(product) {
  // Check different possible structures for image data
  if (product.image) {
    if (Array.isArray(product.image) && product.image.length > 0) {
      if (product.image[0].url) {
        return `https://interplast.onrender.com/api/admin/file/get?fileKey=${product.image[0].url}`;
      } else if (typeof product.image[0] === "string") {
        return `https://interplast.onrender.com/api/admin/file/get?fileKey=${product.image[0]}`;
      }
    } else if (typeof product.image === "string") {
      return `https://interplast.onrender.com/api/admin/file/get?fileKey=${product.image}`;
    }
  }
  // Fallback to a placeholder image
  return "https://via.placeholder.com/300x200?text=No+Image";
}

function showProductDetails(product) {
  console.log("Product details:", product);
  if (!product) return;

  const modal = document.createElement("div");
  modal.className =
    "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50";

  // Safely generate features list if available
  let featuresHtml = "";
  if (product.features && Array.isArray(product.features)) {
    featuresHtml = `
      <div class="mt-6">
        <h3 class="text-lg font-medium text-gray-900 mb-3">Key Features</h3>
        <ul class="grid grid-cols-2 gap-3">
          ${product.features
            .map(
              (feature) => `
          <li class="flex items-center gap-2 text-gray-600">
            <i class="ri-checkbox-circle-line text-primary"></i>
            ${feature}
          </li>
          `
            )
            .join("")}
        </ul>
      </div>
    `;
  }

  modal.innerHTML = `
        <div class="bg-white rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div class="p-6">
                <div class="flex justify-between items-start">
                  <h2 class="text-2xl font-semibold text-gray-900">${
                    product.name || product.title || "Product"
                  }</h2>
                  <button onclick="this.closest('.fixed').remove()" class="p-2 hover:bg-gray-100 rounded-full">
                    <i class="ri-close-line text-xl"></i>
                  </button>
                </div>
                <div class="mt-6">
                  <img src="${getProductImageUrl(product)}" alt="${
    product.name || product.title || "Product"
  }" class="w-full h-80 object-cover rounded-lg">
                </div>
                <div class="mt-6">
                  <p class="text-gray-600">${product.description || ""}</p>
                  ${featuresHtml}
                  <div class="mt-6 flex items-center justify-between">
                    <div>
                    </div>
                    <button class="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary/90 !rounded-button">
                      Add to Cart
                    </button>
                  </div>
                </div>
            </div>
        </div>
    `;
  document.body.appendChild(modal);
  modal
    .querySelector(".bg-white")
    .addEventListener("click", (e) => e.stopPropagation());
  modal.addEventListener("click", (e) => modal.remove());
}

// Function to fetch and process products
function fetchProducts() {
  fetch("https://interplast.onrender.com/api/product/all", {
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
        data = mockProducts;
      }

      // Simple fallback if API doesn't return properly structured data
      if (data.length > 0 && globalCategories.length > 0) {
        // If we have categories but products don't have category info,
        // assign each product to a random category for demonstration
        const needsCategoryAssignment = !data.some(
          (p) =>
            p.categoryId ||
            (p.category && (typeof p.category === "string" || p.category._id))
        );

        if (needsCategoryAssignment) {
          // Distribute products among available categories
          data = data.map((product, index) => {
            // Assign each product to a category from our list
            const categoryIndex = index % globalCategories.length;
            const category = globalCategories[categoryIndex];

            product.categoryId = category._id;
            product.categoryName = category.title;

            return product;
          });
        } else {
          // Standard category mapping as before
          data = data.map((product) => {
            // If product already has categoryId, use it
            if (product.categoryId) {
              return product;
            }

            // If product has category information
            if (product.category) {
              // If category is an object with _id
              if (
                typeof product.category === "object" &&
                product.category._id
              ) {
                product.categoryId = product.category._id;
                product.categoryName =
                  product.category.title || product.category.name || "";
                return product;
              }

              // If category is a string ID (could be MongoDB ObjectId)
              if (typeof product.category === "string") {
                // Check if it's a MongoDB ObjectId (24 hex characters)
                if (product.category.match(/^[0-9a-fA-F]{24}$/)) {
                  product.categoryId = product.category;

                  // Try to find matching category in the globalCategories
                  const matchingCategory = globalCategories.find(
                    (cat) => cat._id === product.category
                  );
                  if (matchingCategory) {
                    product.categoryName =
                      matchingCategory.title || matchingCategory.name || "";
                  }

                  return product;
                }

                // If it's just a category name string, not an ID
                product.categoryName = product.category;

                // Try to find matching category by name
                const matchingCategory = globalCategories.find(
                  (cat) =>
                    (cat.title || cat.name || "").toLowerCase() ===
                    product.category.toLowerCase()
                );

                if (matchingCategory) {
                  product.categoryId = matchingCategory._id;
                }

                return product;
              }
            }

            return product;
          });
        }
      }

      renderProducts(data); // Call the render function after data is loaded
    })
    .catch((error) => {
      console.error("Error fetching products:", error);
      // Fall back to mock data
      renderProducts(mockProducts);
    });
}

// Store categories globally so we can access them when processing products
let globalCategories = [];

// Function to fetch and render categories
function fetchAndRenderCategories() {
  fetch("https://interplast.onrender.com/api/admin/category/all", {
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
      let categories;
      if (responseData.categories && Array.isArray(responseData.categories)) {
        categories = responseData.categories;
      } else if (Array.isArray(responseData)) {
        categories = responseData;
      } else if (responseData.data && Array.isArray(responseData.data)) {
        categories = responseData.data;
      } else {
        console.error(
          "Unexpected API response structure for categories:",
          responseData
        );
        categories = [];
      }

      // Store categories globally for product mapping
      globalCategories = categories;

      renderCategories(categories);

      // Re-fetch products after categories are loaded
      fetchProducts();
    })
    .catch((error) => {
      console.error("Error fetching categories:", error);
    });
}

// Function to render categories
function renderCategories(categories) {
  const categoriesContainer = document.getElementById("categoryContainer");

  if (!categoriesContainer) {
    console.error("Categories container not found");
    return;
  }

  // Clear existing categories except "All" button
  categoriesContainer.innerHTML = `
    <button
      class="category-btn flex items-center gap-2 px-6 py-2 bg-primary text-white rounded-full whitespace-nowrap !rounded-button"
      data-category="all"
    >
      All
    </button>
  `;

  // Add categories from database (main categories only)
  categories.forEach((category) => {
    const categoryButton = document.createElement("button");
    categoryButton.className =
      "category-btn flex items-center gap-2 px-6 py-2 bg-gray-100 text-gray-700 rounded-full whitespace-nowrap hover:bg-gray-200 !rounded-button";
    categoryButton.setAttribute("data-category", category._id);
    categoryButton.innerText = category.title;
    categoriesContainer.appendChild(categoryButton);
  });

  // Add event listeners to category buttons
  document.querySelectorAll(".category-btn").forEach((button) => {
    button.addEventListener("click", function () {
      // Get category info
      const categoryId = this.getAttribute("data-category");

      // Remove active class from all buttons
      document.querySelectorAll(".category-btn").forEach((btn) => {
        btn.classList.remove("bg-primary", "text-white");
        btn.classList.add("bg-gray-100", "text-gray-700");
      });

      // Add active class to clicked button
      this.classList.remove("bg-gray-100", "text-gray-700");
      this.classList.add("bg-primary", "text-white");

      // Filter products by category
      filterProductsByCategory(categoryId);
    });
  });
}

// Function to filter products by category
function filterProductsByCategory(categoryId) {
  // Make sure any previous "no products" message is removed
  const noProductsMessages = document.querySelectorAll(
    "#productContainer > .col-span-full"
  );
  noProductsMessages.forEach((msg) => msg.remove());

  // If "all" is selected, show all products
  if (categoryId === "all") {
    document.querySelectorAll("#productContainer > div").forEach((product) => {
      product.style.display = "block";
    });
    return;
  }

  // Find the category in the globalCategories for additional matching criteria
  const selectedCategory = globalCategories.find(
    (cat) => cat._id === categoryId
  );
  const categoryTitle = selectedCategory
    ? (selectedCategory.title || "").toLowerCase()
    : "";

  // Otherwise, filter products by the selected category
  let foundMatches = 0;
  document.querySelectorAll("#productContainer > div").forEach((product) => {
    const productCategoryId = product.getAttribute("data-category");
    const productCategoryName = product.getAttribute("data-category-name");
    const productParentCategoryId = product.getAttribute(
      "data-parent-category"
    );

    // Try multiple ways to match the category
    let isMatch = false;

    // 1. Direct match by ID
    if (productCategoryId === categoryId) {
      isMatch = true;
    }

    // 2. Match by parent category
    else if (productParentCategoryId === categoryId) {
      isMatch = true;
    }

    // 3. Match by category name if IDs don't match
    else if (
      categoryTitle &&
      productCategoryName &&
      productCategoryName.toLowerCase() === categoryTitle
    ) {
      isMatch = true;
    }

    if (isMatch) {
      product.style.display = "block";
      foundMatches++;
    } else {
      product.style.display = "none";
    }
  });

  // If no products were found for this category, show a message
  if (foundMatches === 0) {
    const container = document.getElementById("productContainer");
    const noProductsMessage = document.createElement("div");
    noProductsMessage.className = "col-span-full text-center p-4";
    noProductsMessage.innerHTML = `<p>No products found in this category</p>`;
    container.appendChild(noProductsMessage);
  }
}

// Initialize only categories first, then products will be fetched after categories are loaded
document.addEventListener("DOMContentLoaded", function () {
  fetchAndRenderCategories();
});
