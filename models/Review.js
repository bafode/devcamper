const mongoose = require("mongoose");
const Bootcamp = require("./Bootcamp");

const ReviewSchema = new mongoose.Schema({
  title: {
    type: String,
    trim: true,
    required: [true, "Please add a title for the review"],
    maxlength: 100,
  },
  text: {
    type: String,
    required: [true, "please add some text"],
  },
  rating: {
    type: Number,
    min: 1,
    max: 10,
    required: [true, "please add a rating between 1 and 10"],
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
ReviewSchema.index({ bootcamp: 1, user: 1 }, { unique: true });

//static method to get average Rating
ReviewSchema.statics.getAverageRating = async function (bootcampId) {
  const obj = await this.aggregate([
    {
      $match: { bootcamp: bootcampId },
    },
    { $group: { _id: "$bootcamp", averageRating: { $avg: "$rating" } } },
  ]);
  // console.log(obj);
  try {
    await this.model("Boutcamp").findByIdAndUpdate(bootcampId, {
      averageRating: Math.ceil(obj[0].averageRating),
    });
  } catch (err) {
    console.error(err);
  }
};

//call getAverageCost after save
ReviewSchema.post("save", function () {
  this.constructor.getAverageRating(this.bootcamp);
});

//call getAverageCost defore remove
ReviewSchema.pre("remove", function () {
  this.constructor.getAverageRating(this.bootcamp);
});

module.exports = mongoose.model("Review", ReviewSchema);
