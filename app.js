const express = require("express");
const cors = require('cors');
const bodyParser = require("body-parser");
const fetchData = require("./modules/cache_data.js");
const PosterAPI = require('./lib/poster-api-wrapper/src/posterApiWrapper').default;
const app = express();
const PORT = 4000;

const cookieParser = require('cookie-parser');
const parseCookie = require('./middleware/parseCookie');

app.use(cookieParser());
app.use(parseCookie);

let items = [];

app.use(bodyParser.urlencoded({ extended: true })); 
app.use(express.static("public"));
app.use('/lib', express.static("lib"));
app.set("view engine", "ejs"); 

app.get("/", (req, res) => {
  res.render("index", { items, activeTab: "list" });
});

app.get("/login", (req, res) => {
  res.render("login", { activeTab: "login" });
});

app.get('/chat', (req, res) => {
  res.render('chat');
});

app.get('/profile/:username', async (req, res) => {
  try {
    const username = req.params.username;

    if (!username) return res.status(501).send('error: missing username');

    const posterApi = new PosterAPI({
      baseURL: 'http://localhost:3000',
      cacheEnabled: true,
      defaultTTL: 60000
    })

    const fullProfile = await posterApi.getUserProfile(username);

    res.render('profile', {
      userProfile: fullProfile.user,
      listeningHistory: fullProfile.user.listeningHistory || [],
      favouriteArtists: fullProfile.user.favouriteArtists || [],
      posts: fullProfile.user.posts || [],
      profileOwner: req.user && req.user.username === username
    });

  } catch (err) {
    console.error('error fetching profile data:', err);
    res.status(500).send('error retrieving profile information');
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
