import PosterAPI from '/lib/poster-api-wrapper/src/posterApiWrapper.js';

async function registerUser(username, email, password) {
    try {
        const response = await window.api.registerUser({ username, email, password });
        return response.message;
    } catch (error) {
        console.error("registration error", error.message);
    }
}

document.addEventListener("DOMContentLoaded", function () {
    const container = document.querySelector(".container");
    const registerBtn = document.querySelector(".register-btn");
    const loginBtn = document.querySelector(".login-btn");
    const registerSubmit = document.querySelector(".register-submit");
    const loginButton = document.querySelector(".login-button");
    const resetButton = document.querySelector(".reset-submit");

    registerBtn?.addEventListener("click", () => {
        container.classList.add("active");
    });
    loginBtn?.addEventListener("click", () => {
        container.classList.remove("active");
    });

    loginButton?.addEventListener("click", async function (e) {
        e.preventDefault();
        const usernameOrEmail = document.querySelector('#loginUsername').value.trim();
        const password = document.querySelector('#loginPassword').value;
        if (!usernameOrEmail || !password) {
            alert('please enter both username/email and password');
            return;
        }
        try {
            const loginResponse = await window.api.loginUser({ usernameOrEmail, password });
            const token = loginResponse.token;

            window.api.setAuthToken(token);
            localStorage.setItem("authToken", token);

            const { userCookie } = await window.api.auth();
            document.cookie = `user=${encodeURIComponent(userCookie)}; path=/; max-age=86400`;

            window.location.replace('/');
        } catch (error) {
            console.error("Login error:", error);
            alert('login failed ' + (error.message || error));
        }
    });

    registerSubmit?.addEventListener("click", async function (e) {
        e.preventDefault();
        const username = document.querySelector("#registerUsername").value.trim();
        const email = document.querySelector("#registerEmail").value.trim();
        const password = document.querySelector("#registerPassword").value;
        if (!username || !email || !password) {
            alert('Please fill in all registration fields');
            return;
        }
        const message = await registerUser(username, email, password);
        if (message) {
            alert(message);
        }
    });

    resetButton?.addEventListener("click", async function (e) {
        e.preventDefault();
        const email = document.querySelector("#resetEmail").value.trim();
        const oldPassword = document.querySelector("#oldPassword").value.trim();
        const newPassword = document.querySelector("#newPassword").value;
        if (!email || !oldPassword || !newPassword) {
            alert('please fill in all fields to reset password');
            return;
        }

        const response = await api.resetPassword({ oldPassword: oldPassword, newPassword: newPassword, email: email });
        // do something with response.message
        // TODO: toast
        window.location.replace('/login');
    });
});