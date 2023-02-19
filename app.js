var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");

const dotenv = require("dotenv");
if (process.env.NODE_ENV === "production") {
  dotenv.config({ path: "./.env.production" });
} else if (process.env.NODE_ENV === "development") {
  dotenv.config({ path: "./.env.development" });
} else if (process.env.NODE_ENV === "local") {
  dotenv.config({ path: "./.env.local" });
}

var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");

var app = express();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

// cors
var cors = require("cors");

var allowlist = [`http://localhost:3000`];
var corsOptionsDelegate = function (req, callback) {
  var corsOptions;
  if (allowlist.indexOf(req.header("Origin")) !== -1) {
    corsOptions = {
      origin: true,
      credentials: true,
    }; // reflect (enable) the requested origin in the CORS response
  } else {
    corsOptions = { origin: false }; // disable CORS for this request
  }
  callback(null, corsOptions); // callback expects two parameters: error and options
};

app.use(
  cors(
    process.env.NODE_ENV !== "production"
      ? { origin: true, credentials: true }
      : corsOptionsDelegate
  )
);

// router
app.use("/", indexRouter);
app.use("/users", usersRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

app.listen(process.env.BACK_PORT, function () {
  console.log(`server listening on port ${process.env.BACK_PORT}!`);
});