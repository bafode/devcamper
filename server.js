const express = require("express");
const dotenv = require("dotenv");
const morgan = require("morgan");
const colors = require("colors");
const path = require("path");
const mongoSanitize = require("express-mongo-sanitize");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const xss = require("xss-clean");
const rateLimit = require("express-rate-limit");
const hpp = require("hpp");
const cors = require("cors");
const fileupload = require("express-fileupload");

//load the env vars
dotenv.config({ path: "./config/config.env" });

const errorHandled = require("./middleware/error");

const connectDB = require("./config/db");
//const logger = require("./middleware/logger");

//routes files
const bootcamps = require("./route/bootcamps");
const courses = require("./route/courses");
const auth = require("./route/auth");
const users = require("./route/users");
const reviews = require("./route/reviews");
const scores = require("./route/scores");

const logger = require("./middleware/logger");
const errorHandler = require("./middleware/error");

//connect to database
connectDB();

const app = express();
//body parser
app.use(express.json());

//Cookie parser
app.use(cookieParser());
//middleware
/*const logger = (req, res, next) => {
  req.hello = "hello world";
  console.log(
    req.method + " " + req.protocol + "://" + req.get("host") + req.originalUrl
  );
  next();
};*/

//dev logging middleware
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}
app.use(morgan("dev"));

//file Uploading
app.use(fileupload());

//sanitize data
app.use(mongoSanitize());
//set header security
app.use(helmet());
//prevent xss attacks
app.use(xss());
//rate limit
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, //10 min
  max: 100,
});
app.use(limiter);
//prevent http param pollution
app.use(hpp());
//enable cores
app.use(cors());

//set static folder
app.use(express.static(path.join(__dirname, "public")));

//mont route
app.use("/api/v1/bootcamps", bootcamps);
app.use("/api/v1/courses", courses);
app.use("/api/v1/auth", auth);
app.use("/api/v1/users", users);
app.use("/api/v1/reviews", reviews);
app.use("api/v1/scores", scores);

//forcement on met les erreur apres les methode controller
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
const server = app.listen(
  PORT,
  console.log(
    "the server is running in " + process.env.NODE_ENV + " mode on port " + PORT
  )
);

//handle unhandled promise rejection
process.on("unhandledRejection", (err, Promise) => {
  console.log("Error: " + err.message);
  //close the server and exit the process
  server.close(() => process.exit(1));
});
