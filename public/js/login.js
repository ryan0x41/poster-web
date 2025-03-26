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

            window.location = '/home-feed';
        } catch (error) {
            console.error("Login error:", error);
            alert('login failed ' + (error.message || error));
        }
    });

    const emailRegex = /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)])/;
    const usernameRegex = /^[a-z0-9_-]{4,}$/;
    const passwordRegex = /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/;

    const registerUsernameInput = document.querySelector("#registerUsername");
    const registerEmailInput = document.querySelector("#registerEmail");
    const registerPasswordInput = document.querySelector("#registerPassword");

    // validate input real time, also convert to lowercase
    registerUsernameInput.addEventListener('input', function () {
        this.value = this.value.toLowerCase();

        if (usernameRegex.test(this.value)) {
            this.style.border = "";
        } else {
            this.style.border = "1px solid red";
        }
    });

    // validate input real time
    registerEmailInput.addEventListener('input', function () {
        if (emailRegex.test(this.value.trim())) {
            this.style.border = "";
        } else {
            this.style.border = "1px solid red";
        }
    });

    // validate input real time
    registerPasswordInput.addEventListener('input', function () {
        if (passwordRegex.test(this.value)) {
            this.style.border = "";
        } else {
            this.style.border = "1px solid red";
        }
    });

    // handle register submission
    registerSubmit?.addEventListener("click", async function (e) {
        e.preventDefault();

        const username = registerUsernameInput.value.trim();
        const email = registerEmailInput.value.trim();
        const password = registerPasswordInput.value;

        // ensure all fields are filled
        if (!username || !email || !password) {
            alert('Please fill in all registration fields');
            return;
        }

        // validate each field before submitting
        if (!usernameRegex.test(username)) {
            alert('invalid username');
            registerUsernameInput.style.border = "1px solid red";
            return;
        }
        if (!emailRegex.test(email)) {
            alert('invalid email');
            registerEmailInput.style.border = "1px solid red";
            return;
        }
        if (!passwordRegex.test(password)) {
            alert('invalid password');
            registerPasswordInput.style.border = "1px solid red";
            return;
        }

        try {
            const { message } = await registerUser(username, email, password);
            console.log(message);
            window.location = '/login';
        } catch (error) {
            console.error(error);
            alert('register failed ' + (error.message || error));
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