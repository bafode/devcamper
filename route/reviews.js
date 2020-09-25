const express = require("express");
const {
  getReviews,
  getReview,
  createReview,
  updateReview,
  deleteReview,
} = require("../controllers/reviews");

const Review = require("../models/Review");

const router = express.Router({ mergeParams: true });

const advancedResults = require("../middleware/advancedResults");
const { protect, autorize } = require("../middleware/auth");

router
  .route("/")
  .get(
    advancedResults(Review, {
      path: "bootcamp",
      select: "name description",
    }),
    getReviews
  )
  .post(protect, autorize("user", "admin"), createReview);

router
  .route("/:id")
  .get(getReview)
  .put(protect, autorize("user", "admin"), updateReview)
  .delete(protect, autorize("user", "admin"), deleteReview);

module.exports = router;
