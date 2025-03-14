require('dotenv').config({ path: './.config' });

const express = require("express");
const bodyParser = require("body-parser");
const fetchData = require("./modules/cache_data.js");
const PosterAPI = require('./lib/poster-api-wrapper/src/posterApiWrapper').default;
const app = express();

// for test enviroment
app.use((req, res, next) => {
  res.locals.apiBaseURL = process.env.WEBURL || 'http://localhost:3000';
  next();
});

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
  if (!req.user || !req.user.username) {
    return res.render("index", { user: null });
  }
  res.render("index", { user: req.user });
});

app.get('/reset-password', (req, res) => {
  res.render('reset-password');
});

app.get('/login', (req, res) => {
  res.render('login', { activeForm: 'login' });
});

app.get('/register', (req, res) => {
  res.render('login', { activeForm: 'register' });
});

app.get('/chat/:conversationId?', (req, res) => {
  res.render('chat');
});

app.get('/start/chat/:userId', (req, res) => {
  res.render('start-chat', { userId: req.params.userId });
});

app.get('/profile/:username', async (req, res) => {
  try {
    const username = req.params.username;

    if (!username) return res.status(501).send('error: missing username');
    const posterApi = new PosterAPI({
      baseURL: process.env.WEBURL || 'http://localhost:3000',
      cacheEnabled: true,
      defaultTTL: 60000
    });

    const fullProfile = await posterApi.getUserProfile(username);
    let posts = fullProfile.user.posts || [];
    if (req.user && req.user.id) {
      posts = posts.map(post => {
        if (post.likedBy && Array.isArray(post.likedBy) && post.likedBy.includes(req.user.id)) {
          post.isLiked = true;
        }
        return post;
      });
    }

    let isFollowing = false;
    if (req.user && req.user.id && fullProfile.user.followers && Array.isArray(fullProfile.user.followers)) {
      isFollowing = fullProfile.user.followers.some(follower => follower.id === req.user.id);
    }

    res.render('profile', {
      userProfile: fullProfile.user,
      listeningHistory: fullProfile.user.listeningHistory || [],
      favouriteArtists: fullProfile.user.favouriteArtists || [],
      posts,
      profileOwner: req.user && req.user.username === username,
      following: isFollowing
    });

  } catch (err) {
    console.error('error fetching profile data:', err);
    res.status(500).send('error retrieving profile information');
  }
});

app.get('/home-feed', async (req, res) => {
  if (!req.user || !req.user.username) {
    res.redirect('/login');
    return;
  }

  res.render('home-feed', { username: req.user.username });
});

app.get('/reauth', async (req, res) => {
  res.render('reauth');
});


app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
