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
