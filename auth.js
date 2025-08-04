// Updated auth.js
function initAuth() {
  const token = localStorage.getItem("token");
  const authLinksContainer = document.getElementById("auth-links");
  const mobileAuthLinksContainer = document.getElementById("mobile-auth-links");

  const logout = (e) => {
    e.preventDefault();
    localStorage.removeItem("token");
    window.location.href = "index.html"; // Redirect to home on logout
  };

  if (token) {
    // --- USER IS LOGGED IN ---
    if (authLinksContainer) {
      authLinksContainer.innerHTML = `<a href="#" id="logout-button" class="text-slate-600 hover:text-primary transition-colors duration-200 font-medium">Logout</a>`;
      document
        .getElementById("logout-button")
        .addEventListener("click", logout);
    }
    if (mobileAuthLinksContainer) {
      mobileAuthLinksContainer.innerHTML = `<a href="#" id="mobile-logout-button" class="hover:text-primary transition duration-300">Logout</a>`;
      document
        .getElementById("mobile-logout-button")
        .addEventListener("click", logout);
    }
  } else {
    // --- USER IS LOGGED OUT ---
    if (authLinksContainer) {
      // Styles for the desktop header
      authLinksContainer.innerHTML = `
        <a href="login.html" class="text-slate-600 hover:text-primary transition-colors duration-200 font-medium">Login</a>
        <a href="register.html" class="bg-slate-800 text-white font-semibold px-4 py-2 rounded-lg hover:bg-slate-900 transition-colors duration-300">Register</a>
      `;
    }
    if (mobileAuthLinksContainer) {
      // Styles for the dark mobile menu
      mobileAuthLinksContainer.innerHTML = `
        <a href="login.html" class="hover:text-primary transition duration-300">Login</a>
        <a href="register.html" class="bg-white text-slate-800 font-semibold px-6 py-2 rounded-lg hover:bg-slate-200 transition-colors duration-300">Register</a>
      `;
    }
  }
}

// Ensure the function runs after the page content is loaded
document.addEventListener("DOMContentLoaded", initAuth);
