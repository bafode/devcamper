const fs = require("fs");
const mongoose = require("mongoose");
const colors = require("colors");
const dotenv = require("dotenv");

//load env vars
dotenv.config({ path: "./config/config.env" });

//load models
const Bootcamp = require("./models/Bootcamp");
const Course = require("./models/Course");
const Review = require("./models/Review");

const { assert } = require("console");
const User = require("./models/User");

//connect to the db
mongoose.connect(process.env.MONGO_URI, {
  useCreateIndex: true,
  useNewUrlParser: true,
  useFindAndModify: false,
  useUnifiedTopology: true,
});

//read json files
const bootcamp = JSON.parse(fs.readFileSync("./_data/bootcamps.json", "utf-8"));
const courses = JSON.parse(fs.readFileSync("./_data/courses.json", "utf-8"));
const users = JSON.parse(fs.readFileSync("./_data/users.json", "utf-8"));
const reviews = JSON.parse(fs.readFileSync("./_data/reviews.json", "utf-8"));

//import in to database
const importData = async () => {
  try {
    await Bootcamp.create(bootcamp);
    await Course.create(courses);
    await User.create(users);
    await Review.create(reviews);
    console.log("Data imported".green.inverse);
    process.exit();
  } catch (err) {
    console.error(err);
  }
};

//delete data from the database
const deleteData = async () => {
  try {
    await Bootcamp.deleteMany();
    await Course.deleteMany();
    await User.deleteMany();
    await Review.deleteMany();
    console.log("Data Destroyed".red.inverse);
    process.exit();
  } catch (err) {
    console.error(err);
  }
};

if (process.argv[2] === "-i") {
  importData();
} else if (process.argv[2] === "-d") {
  deleteData();
} else {
}
