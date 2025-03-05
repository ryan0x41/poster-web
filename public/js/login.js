import PosterAPI from '/lib/poster-api-wrapper/src/posterApiWrapper.js';

async function registerUser(username, email, password) {
    const api = new PosterAPI({
        baseURL: 'https://api.poster-social.com',
    });

    // try to register user
    try {
        const { message } = await api.registerUser({
            username,
            email,
            password
        });
        
        return message;
    } catch (error) {
        console.error({ error: error.message });
    }
}   

document.addEventListener("DOMContentLoaded", function () {
    const container = document.querySelector(".container");
    const registerBtn = document.querySelector(".register-btn");
    const loginBtn = document.querySelector(".login-btn");

    const registerSubmit = document.querySelector(".register-submit");

    if (!container) console.error("Container not found!");
    if (!registerBtn) console.error("Register button not found!");
    if (!loginBtn) console.error("Login button not found!");
  
    // animate on click
    registerBtn?.addEventListener("click", () => {
        container.classList.add("active"); 
    });
  
    // animate on click
    loginBtn?.addEventListener("click", () => {
        container.classList.remove("active"); 
    });

    // register a user on click, take values from input boxes and send a request to api using wrapper
    registerSubmit?.addEventListener("click", async () => {
        const username = document.querySelector("#registerUsername").value;
        const email = document.querySelector("#registerEmail").value;
        const password = document.querySelector("#registerPassword").value;

        const { message } = await registerUser(username, email, password);
    })

  });
  