const express = require("express");
const {
  getBootcamps,
  getBootcamp,
  createBootcamp,
  updateBootcamp,
  deleteBootcamp,
  getBootcampInRadius,
  bootcampPhotoUpload,
} = require("../controllers/bootcamps");

const Bootcamp = require("../models/Bootcamp");
const advanceddResults = require("../middleware/advancedResults");

//Include others resources router
const courseRouter = require("./courses");
const reviewRouter = require("./reviews");

const router = express.Router();

//protect middleware
const { protect, autorize } = require("../middleware/auth");

//re-route into other resource routers
router.use("/:bootcampId/courses", courseRouter);
router.use("/:bootcampId/reviews", reviewRouter);

router
  .route("/:id/photo")
  .put(protect, autorize("publisher", "admin"), bootcampPhotoUpload);

router.route("/radius/:zipcode/:distance").get(getBootcampInRadius);

router
  .route("/")
  .get(advanceddResults(Bootcamp, "courses"), getBootcamps)
  .post(protect, autorize("publisher", "admin"), createBootcamp);
router
  .route("/:id")
  .get(getBootcamp)
  .put(protect, autorize("publisher", "admin"), updateBootcamp)
  .delete(protect, autorize("publisher", "admin"), deleteBootcamp);

module.exports = router;
