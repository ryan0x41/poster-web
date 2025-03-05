document.addEventListener("DOMContentLoaded", function() {

    const conversationLinks = document.querySelectorAll('[data-conversation]');

    conversationLinks.forEach(link => {
        link.addEventListener("click", function(event) {
            event.preventDefault();

            const convId = this.getAttribute("data-conversation");
            const convEl = document.querySelector(convId);

            document.querySelector(".default-view").classList.remove("active");
            document.querySelectorAll(".conversation-chat").forEach(c => c.classList.remove("active"));

            if (convEl) {
                convEl.classList.add("active");
            }

            conversationLinks.forEach(l => l.parentElement.classList.remove("active"));
            this.parentElement.classList.add("active");
            if (window.innerWidth <= 768) {
                document.querySelector(".chat-container").classList.add("mobile-chat-active");
            }
        });
    });

    const backButtons = document.querySelectorAll(".back-button");

    backButtons.forEach(btn => {
        btn.addEventListener("click", function(event) {
            event.preventDefault();

            document.querySelectorAll(".conversation-chat").forEach(c => c.classList.remove("active"));
            document.querySelector(".default-view").classList.add("active");

            if (window.innerWidth <= 768) {
                document.querySelector(".chat-container").classList.remove("mobile-chat-active");
            }
        });
    });

    const chatForms = document.querySelectorAll(".chat-form");
    chatForms.forEach(form => {
        form.addEventListener("submit", function(event) {
            event.preventDefault();

            const textarea = this.querySelector("textarea");

            if (textarea && textarea.value.trim() !== "") {
                // TODO: we need websockets ahhh
                console.log("sending message:", textarea.value);
                textarea.value = "";
            }
        });
    });
});