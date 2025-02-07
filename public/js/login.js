document.addEventListener("DOMContentLoaded", function () {
    const container = document.querySelector(".container");
    const registerBtn = document.querySelector(".register-btn");
    const loginBtn = document.querySelector(".login-btn");
  
    if (!container) console.error("Container not found!");
    if (!registerBtn) console.error("Register button not found!");
    if (!loginBtn) console.error("Login button not found!");
  
    registerBtn?.addEventListener("click", () => {
        container.classList.add("active"); 
    });
  
    loginBtn?.addEventListener("click", () => {
        container.classList.remove("active"); 
    });
  });
  