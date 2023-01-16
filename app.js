require("dotenv").config();
const express = require("express");
const app = express();
const http = require("http");
const path = require("path");
const PORT = process.env.PORT;
const hbs = require("hbs");
const csrf = require("csurf");
var session = require("express-session");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
var MemoryStore = require("connect-mongo");
const passport = require("passport");
const cors = require("cors");
const flash = require("connect-flash");
const favicon = require("serve-favicon");

//! middleware
app.use(morgan("dev"));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser("random"));

const server = http.createServer(app);

// db
require("./src/db/conn");

const static_path = path.join(__dirname, "./public");
const template_path = path.join(__dirname, "./templates/views");
const partial_path = path.join(__dirname, "./templates/partials");

app.use(express.static(static_path));
//! set Template engine

app.set("view engine", "hbs");
app.set("views", template_path);
hbs.registerPartials(partial_path);

app.use(cookieParser("random"));

// favicon
app.use(favicon(path.join(__dirname, "./public", "favicon.ico")));

app.use(
  session({
    name: "session-id",
    secret: "random",
    saveUninitialized: true,
    resave: true,
    store: MemoryStore.create({
      mongoUrl: process.env.DATABASE,
      collection: "sessions",
    }),
    cookie: { maxAge: 1000 * 60 * 60 * 24 },
  })
);


app.use(csrf());
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

// global middleware
app.use((req, res, next) => {
  res.locals.session = req.session;
  res.locals.user = req.user;
  next();
})

app.use(function (req, res, next) {
  res.locals.session = req.session;
  res.locals.user = req.user;
  res.locals.success_messages = req.flash("success_messages");
  res.locals.error_messages = req.flash("error_messages");
  res.locals.error = req.flash("error");
  res.locals.csrftoken = req.csrfToken();
  next();
});


// ! ecommerce routes 
app.use(require("./src/routes/routes"));

// ! ecommerce routes 
app.use(require("./src/routes/adminRoutes"));


// catch 404 and forward to error handler
app.get('*', (req, res, next) => {
  res.status(404).render('404');
})
server.listen(PORT, () => {
  console.log(`connection successful at port ${PORT}`);
  console.log(`http://localhost:${PORT}`);
});

