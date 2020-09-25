const express = require("express");
const {
  getScores,
  getScore,
  createScore,
  updateScore,
  deleteScore,
} = require("../controllers/score");

const Score = require("../models/Score");

const router = express.Router({ mergeParams: true });

const advancedResults = require("../middleware/advancedResults");
const { protect, autorize } = require("../middleware/auth");

router
  .route("/")
  .get(
    advancedResults(Score, {
      path: "bootcamp",
      select: "name description",
    }),
    getScores
  )
  .post(protect, autorize("user", "admin"), createScore);

router
  .route("/:id")
  .get(getScore)
  .put(protect, autorize("user", "admin"), updateScore)
  .delete(protect, autorize("user", "admin"), deleteScore);

module.exports = router;
