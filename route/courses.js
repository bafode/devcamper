const express = require("express");

//implamenting of advanced middleware
const Course = require("../models/Course");
const advancedResults = require("../middleware/advancedResults");

const {
  getCoures,
  getCoure,
  addCourse,
  updateCourse,
  deleteCourse,
} = require("../controllers/courses");

const router = express.Router({ mergeParams: true });

//protect middleware
const { protect, autorize } = require("../middleware/auth");

router
  .route("/")
  .get(
    advancedResults(Course, {
      path: "bootcamp",
      select: "name description",
    }),
    getCoures
  )
  .post(protect, autorize("publisher", "admin"), addCourse);
router
  .route("/:id")
  .get(getCoure)
  .put(protect, autorize("publisher", "admin"), updateCourse)
  .delete(protect, autorize("publisher", "admin"), deleteCourse);

module.exports = router;
