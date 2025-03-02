// import PosterAPI from '/lib/poster-api-wrapper/src/posterApiWrapper.js';
// const PosterAPI = require("/lib/poster-api-wrapper/src/posterApiWrapper.js");


// const api = new PosterAPI({
//   baseURL: 'http://api.poster-social.com',
// });

const express = require("express");
const bodyParser = require("body-parser");
// const fetchData = require("https://api.poster-social.com");
const app = express();
const PORT = 4000;

let items = [];

// Middleware
app.use(bodyParser.urlencoded({ extended: true })); // Parse form data
app.use(express.static("public")); // Serve static files
app.use('/lib', express.static("lib"));
app.set("view engine", "ejs"); // Set EJS as the view engine

// List Data
app.get("/refresh", async (req, res) => {
  items = await fetchData();
  console.log(items);
  res.render("api", { items: items, activeTab: "API" });
  //res.redirect("/");
});

// 1. Index Page: Show list of items with add and delete actions
app.get("/", (req, res) => {
    res.render("index", { items, activeTab: "list" });
  });

// 5. API Endpoint: Provide chart data
app.get("/api/chart-data", (req, res) => {
  const labels = items.map((item) => item.name);
  const values = items.map((item) => item.value);
  res.json({ labels, values });
});
app.get("/login", (req, res) => {
  res.render("login", { activeTab: "login" });
});
app.get('/chat', (req, res) => {
  res.render('chat');
});
app.get('/profile', (req, res) => {
  res.render('profile', { activeTab: "profile" });
});
app.get('/feed', (req, res) => {
  res.render('feed', { activeTab: "feed" });
});
app.get('/chat', (req, res) => {
  res.render('chat', { activeTab: "chat" });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
