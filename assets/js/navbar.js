// Navbar functionality with categories dropdown

document.addEventListener("DOMContentLoaded", function () {
  // Initialize the navbar
  initializeNavbar();

  // Fetch categories for dropdown
  fetchCategories();
});

/**
 * Initialize navbar functionality
 */
function initializeNavbar() {
  // Find the products nav link
  const productsLink = document.querySelector('nav a[href="/products"]');

  if (productsLink) {
    // Create dropdown container
    const dropdown = document.createElement("div");
    dropdown.className =
      "absolute left-0 transform -translate-x-1/4 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 opacity-0 invisible transition-all duration-200 z-50";
    dropdown.setAttribute("id", "categoriesDropdown");

    // Create dropdown content
    const dropdownContent = document.createElement("div");
    dropdownContent.className = "py-1";
    dropdownContent.innerHTML =
      '<div class="px-4 py-2 text-sm text-gray-500">Kategoriyalar yüklənir...</div>';

    // Add dropdown to the DOM
    dropdown.appendChild(dropdownContent);

    // Create a container for the products link and dropdown
    const container = document.createElement("div");
    container.className = "relative group";

    // Replace the products link with the container
    productsLink.parentNode.replaceChild(container, productsLink);

    // Add the products link to the container
    container.appendChild(productsLink);

    // Add the dropdown to the container
    container.appendChild(dropdown);

    // Show dropdown on hover
    container.addEventListener("mouseenter", function () {
      dropdown.classList.remove("opacity-0", "invisible");
      dropdown.classList.add("opacity-100");
    });

    container.addEventListener("mouseleave", function () {
      dropdown.classList.add("opacity-0", "invisible");
      dropdown.classList.remove("opacity-100");
    });
  }
}

/**
 * Fetch categories from the API
 */
function fetchCategories() {
  fetch("https://api.interplast-a.com/api/categories/all", {
    method: "GET",
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      // Handle different possible response structures
      let categories;
      if (
        data.data &&
        data.data.categories &&
        Array.isArray(data.data.categories)
      ) {
        // New API format: data.data.categories
        categories = data.data.categories;
      } else if (data.categories && Array.isArray(data.categories)) {
        categories = data.categories;
      } else if (Array.isArray(data)) {
        categories = data;
      } else if (data.data && Array.isArray(data.data)) {
        categories = data.data;
      } else {
        console.error("Unexpected API response structure:", data);
        categories = [];
      }

      // Populate dropdown with categories
      populateCategoriesDropdown(categories);
    })
    .catch((error) => {
      console.error("Error fetching categories:", error);

      // Show error in dropdown
      const dropdown = document.getElementById("categoriesDropdown");
      if (dropdown) {
        const dropdownContent = dropdown.querySelector("div");
        dropdownContent.innerHTML =
          '<div class="px-4 py-2 text-sm text-red-500">Kategoriyaları yükləmək mümkün olmadı</div>';
      }
    });
}

/**
 * Populate the categories dropdown with items
 * @param {Array} categories - Array of category objects
 */
function populateCategoriesDropdown(categories) {
  const dropdown = document.getElementById("categoriesDropdown");
  if (!dropdown) return;

  const dropdownContent = dropdown.querySelector("div");

  if (!categories || categories.length === 0) {
    dropdownContent.innerHTML =
      '<div class="px-4 py-2 text-sm text-gray-500">Kategori yoxdur</div>';
    return;
  }

  // Create dropdown items
  let dropdownHTML = "";

  // First, add "All Products" link
  dropdownHTML += `
    <a href="/products" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
      Bütün Məhsullar
    </a>
  `;

  // Add category links
  categories.forEach((category) => {
    dropdownHTML += `
      <a href="/category?id=${
        category._id
      }" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
        ${category.name || category.title || "Untitled Category"}
      </a>
    `;
  });

  // Update dropdown content
  dropdownContent.innerHTML = dropdownHTML;
}
