document.addEventListener("DOMContentLoaded", () => {
  // --- 1. SHARED UI FUNCTIONS ---

  // Handles the header changing color on scroll
  const handleHeaderScroll = () => {
    const header = document.getElementById("main-header");
    if (!header) return;
    window.addEventListener("scroll", () => {
      // Use a class that is less likely to conflict with Tailwind's bg-white
      header.classList.toggle("scrolled", window.scrollY > 50);
    });
  };

  // Manages the mobile navigation menu
  const initMobileMenu = () => {
    const mobileMenuButton = document.getElementById("mobile-menu-button");
    const closeMobileMenuButton = document.getElementById("close-mobile-menu");
    const mobileMenu = document.getElementById("mobile-menu");
    if (!mobileMenuButton || !closeMobileMenuButton || !mobileMenu) return;

    mobileMenuButton.addEventListener("click", () => {
      mobileMenu.classList.remove("hidden");
      requestAnimationFrame(() => {
        mobileMenu.classList.remove("translate-x-full");
      });
    });

    closeMobileMenuButton.addEventListener("click", () => {
      mobileMenu.classList.add("translate-x-full");
      // Wait for animation to finish before hiding
      setTimeout(() => mobileMenu.classList.add("hidden"), 300);
    });
  };

  // Updates the cart count in the header
  const updateCartCount = () => {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    document.getElementById("cart-count").textContent = cartCount;
    document.getElementById("mobile-cart-count").textContent = cartCount;
  };

  // Manages the Login/Logout/Register links
  const initAuth = () => {
    const token = localStorage.getItem("token");
    const authLinksContainer = document.getElementById("auth-links");
    const mobileAuthLinksContainer =
      document.getElementById("mobile-auth-links");
    if (!authLinksContainer || !mobileAuthLinksContainer) return;

    const logout = (e) => {
      e.preventDefault();
      localStorage.removeItem("token");
      window.location.href = "login.html";
    };

    if (token) {
      authLinksContainer.innerHTML = `<a href="#" id="logout-button" class="text-slate-600 hover:text-primary transition-colors duration-200 font-medium">Logout</a>`;
      mobileAuthLinksContainer.innerHTML = `<a href="#" id="mobile-logout-button" class="hover:text-primary transition duration-300">Logout</a>`;
      document
        .getElementById("logout-button")
        .addEventListener("click", logout);
      document
        .getElementById("mobile-logout-button")
        .addEventListener("click", logout);
    } else {
      authLinksContainer.innerHTML = `<a href="login.html" class="text-slate-600 hover:text-primary transition-colors duration-200 font-medium">Login</a> <a href="register.html" class="bg-slate-800 text-white font-semibold px-4 py-2 rounded-lg hover:bg-slate-900 transition-colors duration-300">Register</a>`;
      mobileAuthLinksContainer.innerHTML = `<a href="login.html" class="hover:text-primary transition duration-300">Login</a> <a href="register.html" class="bg-white text-slate-800 font-semibold px-6 py-2 rounded-lg hover:bg-slate-200 transition-colors duration-300">Register</a>`;
    }
  };

  // --- 2. INITIALIZE ALL SHARED FUNCTIONS ---
  handleHeaderScroll();
  initMobileMenu();
  updateCartCount();
  initAuth();
});
