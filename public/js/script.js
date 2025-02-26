var menu = document.querySelector(".settings-menu");
var darkBtn = document.getElementById("dark-btn");


function toggleSettingsMenu(){
    menu.classList.toggle("settings-menu-height"); 
}

darkBtn.onclick = function () {
    darkBtn.classList.toggle("dark-btn-on");
    document.body.classList.toggle("dark-theme");

    
    if (document.body.classList.contains("dark-theme")) {
        localStorage.setItem("darkMode", "enabled");
    } else {
        localStorage.setItem("darkMode", "disabled");
    }
};

window.onload = function () {
    if (localStorage.getItem("darkMode") === "enabled") {
        document.body.classList.add("dark-theme");
        darkBtn.classList.add("dark-btn-on");
    }
};
