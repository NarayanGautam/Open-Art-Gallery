/*
    Term Project
    Shuva Gautam
    COMP 2406
    December 9, 2022
    server.js - server side code for project
    Base code from Tutorial 9 demonstration code provided on Brightspace
*/

// import express module, and express session module
import express from 'express';
import session from 'express-session';
// connect mongodb session module and morgan module for logging requests
import { default as connectMongoDBSession} from 'connect-mongodb-session';
import logger from 'morgan';

// import mongoose module
import mongoose from 'mongoose';

// create express app and mongodb session store
const MongoDBStore = connectMongoDBSession(session);
const app = express();

// store connection and sessions in mongodb store
let store = new MongoDBStore({
    uri: 'mongodb://127.0.0.1:27017/termproject',
    collection: 'sessions'
});

// use session middleware
app.use(session({
    secret: 'secret key',
    resave: true,
    saveUninitialized: false,
    store: store
}));

// express urlencoded middleware
app.use(express.urlencoded({extended: true}));

// import user and gallery models 
import User from './UserModel.js';
import Gallery from './GalleryModel.js';

// use morgan logger middleware
app.use(logger('dev'));

// use express static middleware to serve static files and express json middleware to parse json
app.use(express.static("public"));
app.use(express.json());

// set up views and view engine
app.set('views', './views');
app.set('view engine', 'pug');

// get request route to render index page
app.get(['/', 'home'], async (req, res) => {
    try {
        if (req.session.loggedin) {
            // get 6 galleries from database
            let gallery = await Gallery.find({}).limit(6);
            res.render('pages/index', { session: req.session, gallery: gallery });
        } else {
            res.render('pages/index', { session: req.session });
        }            
    } catch (err) {
        console.log(err);
    }
});

// get request route to render register page
app.get("/register", (req, res) => {
    res.render("pages/register", { session: req.session });
});

// get request route to render login page
app.get("/login", (req, res) => {
    res.render("pages/login", { session: req.session });
});

// post request route for registering a new user
app.post("/register", async (req, res) => {
    let newUser = req.body;

    try {
        // check if username already exists
        const searchResult = await User.findOne({ username: newUser.username });
        // if it does not, create a new user and add to database
        if (searchResult == null) {
            console.log("registering: " + JSON.stringify(newUser));
            await User.create(newUser);
            res.status(200).send("User created");
        } else {
            // else user already exists and repspond with error
            console.log("User already exists");
            res.status(404).json({error: 'User Exists'});
        }
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: "Error registering" });
    }
});

// login post request route that check database for user and logs in if user exists
app.post("/login", async (req, res) => {
    // get username and password from request body
    let username = req.body.username;
    let password = req.body.password;

    // try finding if username exists in database
    try {
        const searchResult = await User.findOne({ username: username });
        // if it does, check if password matches
        if (searchResult != null) {
            // if it does, update user session and render index page
            if (searchResult.password === password) {
                req.session.loggedin = true;
                req.session.username = searchResult.username;
                req.session.userid = searchResult._id;
                req.session.type = searchResult.accountType;
                console.log(req.session);
                res.status(200).send("Logged in");
            } else {
                res.status(401).send("Invalid password");
            }
        } else {
            res.status(401).send("Invalid password");
        }
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: "Error logging in" });
    }
});

// logout get request route that logs out user if they are logged in and redirects to index page
app.get("/logout", (req, res) => {
    if (req.session.loggedin) {
        req.session.loggedin = false;
        console.log(req.session);
        console.log("logged out");
    }
    res.redirect("/");
});

// get request route to render gallery page pagination 
app.get("/gallery", async (req, res) => {
    // get page number from request query and if it is not valid, set it to 1
    let page = req.query.page > 0 ? req.query.page : 1;
    // limit number of artworks per page to 15
    let limit = 15;
    // calculate number of artworks to skip
    let skip = (page - 1) * limit;
    try {
        // get all artworks from database using skip and limit
        let gallery = await Gallery.find({}).skip(skip).limit(limit);
        console.log("found the items from " + skip + " to " + (skip + limit));
        res.render('pages/gallery', { session: req.session, gallery: gallery, page: page });
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: "Error getting gallery" });
    }
});


// get request route to render gallery page of a specific artwork
app.get("/gallery/:id", async (req, res) => {
    // get id from request parameter
    let id = req.params.id;

    try {
        // search database for artwork with id
        const searchResult = await Gallery.findOne({ _id: id });
        res.render('pages/artwork', { session: req.session, artwork: searchResult });
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: "Error getting gallery" });
    }
});

// get request route to render add artwork page
app.get("/addartwork", async (req, res) => {
    try {
        // check if user is logged in and is an artist
        if (req.session.type == "artist") {
            res.render('pages/addartwork', { session: req.session });
        } else {
            res.redirect("/account");
        }            
    } catch (err) {
        console.log(err);
    }
});

// post request route to add a new artwork to the database
app.post("/gallery", async (req, res) => {
    let newArtwork = req.body;

    // check if artwork already exists, if it does not, add to database
    try {
        const searchResult = await Gallery.findOne({ name: newArtwork.name });
        if (searchResult == null) {
            console.log("registering: " + JSON.stringify(newArtwork));
            await Gallery.create(newArtwork);
            // redirect back to add artwork page
            res.redirect("/addartwork");
        }
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: "Error adding artwork" });
    }
});

// get request route to render account page, where user can change account type
app.get("/account", async (req, res) => {
    try {
        res.render('pages/account', { session: req.session });
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: "Error getting account" });
    }
});

// put request route to change account type
app.put("/account", async (req, res) => {
    let username = req.body.username;
    // try finding if username exists in database
    try {
        const searchResult = await User.findOne({ username: username });
        // if it does, change account type
        if (searchResult != null) {
            console.log("updating: " + JSON.stringify(req.body));
            if (searchResult.accountType === "artist") {
                await User.updateOne({ username: username }, { accountType: "patron" });
                req.session.type = "patron";
            } else {
                await User.updateOne({ username: username }, { accountType: "artist" });
                req.session.type = "artist";
            }
            res.status(200).send(req.session.type);
        }
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: "Error updating account" });
    }
});

// get request route to render artists page using pagination
app.get("/artists", async (req, res) => {
    // similar to gallery page pagination, get page limit and skip
    let page = req.query.page > 0 ? req.query.page : 1;
    let limit = 15;
    let skip = (page - 1) * limit;
    // find artists with skip and limit to support pagination, then render page
    try {
        let artists = await Gallery.find({}).select('artist').skip(skip).limit(limit);
        console.log("found the items from " + skip + " to " + (skip + limit));
        res.render('pages/artists', { session: req.session, artists: artists, page: page });
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: "Error getting artists" });
    }
});

// get request route to render a specific artist page
app.get("/artists/:name", async (req, res) => {
    // get artist name from request parameter
    let artist = req.params.name;
    console.log(artist);
    // find all artworks by artist and render page
    try {
        let gallery = await Gallery.find({ artist: artist });
        res.render('pages/artist', { session: req.session, gallery: gallery , artist: artist});
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: "Error getting artist" });
    }
});


// function that connects to mongodb database 
const loadData = async () => {
    const result = await mongoose.connect('mongodb://127.0.0.1:27017/termproject', {
        useNewUrlParser: true,
        useUnifiedTopology: true
    });
    return result;
};
// call loaddata function then listen on port 3000
loadData()
  .then(() => {
    app.listen(3000);
    console.log("Listening on http://localhost:3000/");
  })
  .catch(err => console.log(err));



