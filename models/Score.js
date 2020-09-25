const mongoose = require("mongoose");

const ScoreSchema = new mongoose.Schema({
  score: {
    type: Number,
    required: [true, "Please add a title for the review"],
    min: 0,
    max: 100,
  },
  description: {
    type: String,
    required: [true, "please add some text"],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  bootcamp: {
    type: mongoose.Schema.ObjectId,
    ref: "Bootcamp",
    required: true,
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: true,
  },
});

//prevent user for submitting more than one review per bootcams
ScoreSchema.index({ bootcamp: 1, user: 1 }, { unique: true });

module.exports = mongoose.model("Score", ScoreSchema);
