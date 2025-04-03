const menuBtn = document.getElementById("menuBtn");
const mobileMenu = document.getElementById("mobileMenu");
let isMenuOpen = false;
menuBtn.addEventListener("click", () => {
  isMenuOpen = !isMenuOpen;
  mobileMenu.classList.toggle("hidden");
  menuBtn.innerHTML = isMenuOpen
    ? '<i class="ri-close-line text-2xl"></i>'
    : '<i class="ri-menu-line text-2xl"></i>';
});

// Mobile products dropdown functionality
const mobileProductsBtn = document.getElementById("mobileProductsDropdownBtn");
const mobileProductsDropdown = document.getElementById(
  "mobileProductsDropdown"
);

if (mobileProductsBtn && mobileProductsDropdown) {
  let isProductsDropdownOpen = false;

  mobileProductsBtn.addEventListener("click", () => {
    isProductsDropdownOpen = !isProductsDropdownOpen;
    mobileProductsDropdown.classList.toggle("hidden");

    // Rotate arrow icon
    const arrow = mobileProductsBtn.querySelector("i");
    if (arrow) {
      arrow.style.transform = isProductsDropdownOpen ? "rotate(180deg)" : "";
    }
  });

  // Populate mobile products dropdown with categories
  function populateMobileCategories() {
    // First check if we've already populated
    if (mobileProductsDropdown.childElementCount > 1) return;

    fetch("https://api.interplast-a.com/api/categories/all", {
      method: "GET",
    })
      .then((response) => response.json())
      .then((data) => {
        let categories = [];

        // Handle different possible response structures
        if (
          data.data &&
          data.data.categories &&
          Array.isArray(data.data.categories)
        ) {
          categories = data.data.categories;
        } else if (data.categories && Array.isArray(data.categories)) {
          categories = data.categories;
        } else if (Array.isArray(data)) {
          categories = data;
        } else if (data.data && Array.isArray(data.data)) {
          categories = data.data;
        }

        if (categories.length > 0) {
          // Add category links after "All Products"
          categories.forEach((category) => {
            const categoryLink = document.createElement("a");
            categoryLink.href = `/category?id=${category._id}`;
            categoryLink.className =
              "block py-2 pl-4 text-gray-700 hover:text-primary";
            categoryLink.textContent =
              category.name || category.title || "Untitled Category";
            mobileProductsDropdown.appendChild(categoryLink);
          });
        }
      })
      .catch((error) => {
        console.error("Error fetching categories for mobile menu:", error);
      });
  }

  // Load categories when the menu is opened
  menuBtn.addEventListener("click", () => {
    if (isMenuOpen) {
      populateMobileCategories();
    }
  });

  // Also load categories when product dropdown is clicked
  mobileProductsBtn.addEventListener("click", populateMobileCategories);
}
