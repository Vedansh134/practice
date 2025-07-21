const express = require("express");
const app = express();
const port = 8000;
const mongoose = require("mongoose");
const shopItems = require("./models/shop.js");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");

//express-session
const session = require("express-session");
const flash = require("connect-flash");

// passport
const passport = require("passport");
const localStrategy = require("passport-local");
const User = require("./models/user.js");

//router
const prodRouter = require("./routes/item.js");
const userRouter = require("./routes/user.js");


app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(methodOverride("_method"));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

// Create a session
const sessionOption = {
    secret : "this side vedansh kumar",
    resave : false,
    saveUninitialized : true,
    cookie : {
        expires : Date.now()+7*24*60*60*1000,
        maxAge : 7*24*60*60*1000,
        httpOnly : true
    },
};

// mongodb connection
// main()
//     .then(() => {
//         console.log("connect successfully with mongoDB");
//     }).catch((err) => {
//         console.log(err);
//         console.log("there is a error while connecting to database");
//     });

// async function main() {
//     await mongoose.connect("mongodb://127.0.0.1:27017/shopmart");
//     //await mongoose.connect("mongodb://mongodb:27017/shopmart"); for docker container
// };
async function connectDB() {
    await mongoose.connect("mongodb://mongodb:27017/shopmart");
    console.log("Connected successfully");
}

connectDB().then(() => {
    // Optional: Start your server here
}).catch((err) => {
    console.error("Connection error:", err);
});
// use for remove error in docker files

app.get("/", (req, res) => {
    // res.send("apps working");
    res.redirect('/show');
});


//session is mandotory for passport and connect-flash
app.use(session(sessionOption));
app.use(flash());


//implement passport
app.use(passport.initialize());
app.use(passport.session());
// use static authenticate method of model in LocalStrategy
passport.use(new localStrategy(User.authenticate()));
// use static serialize and deserialize of model for passport session support
// store user related info in session
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// middleware for flash-connect
app.use((req,res,next)=>{
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;
    console.log(res.locals.success);
    next();
});


// middleware for succcess-flash msg
//register(user, password, callback) Convenience method to register a new user instance with a given password. Checks if username is unique.
// app.get("/demo", async (req,res) => {
//     let fakeUser = new User({
//         email :  "abc.23@.com",
//         username : "deltastu"
//     });
//     let newRegUsr = await User.register(fakeUser, "password");
//     res.send(newRegUsr);
//     //register method save data of user in db automatically
// });

// use from router => listing.js and review.js and user.js


app.use("/show", prodRouter);
app.use("/", userRouter);

app.listen(port, () => {
    console.log(`app listen on port number ${port}`);
});

