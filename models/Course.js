const mongoose = require("mongoose");
const Bootcamp = require("./Bootcamp");

const CourseSchema = new mongoose.Schema({
  title: {
    type: String,
    trim: true,
    required: [true, "Please add a course title"],
  },
  description: {
    type: String,
    required: [true, "please add a description"],
  },
  weeks: {
    type: String,
    required: [true, "please add number of weeks"],
  },
  tuition: {
    type: String,
    required: [true, "please add tuition cost"],
  },
  minimumSkill: {
    type: String,
    required: [true, "please add a minimum skill"],
    enum: ["beginner", "intermediate", "advanced"],
  },
  scholarshipAvailable: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  bootcamp: {
    type: mongoose.Schema.ObjectId,
    ref: "Bootcamp",
    // required: true,
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: true,
  },
});

//static method to get average of course tuition
CourseSchema.statics.getAverageCost = async function (bootcampId) {
  console.log("calculating average cost".blue);
  console.log("bootcampİd", bootcampId);
  const obj = await this.aggregate([
    {
      $match: { bootcamp: bootcampId },
    },
    { $group: { _id: "$bootcamp", averageCost: { $avg: "$tuition" } } },
  ]);
  console.log(obj);
  try {
    await this.model("Bootcamp").findByIdAndUpdate(bootcampId, {
      averageCost: Math.ceil(obj[0].averageCost / 10) * 10,
    });
  } catch (err) {
    console.error(err);
  }
};

//call getAverageCost after save
CourseSchema.post("save", function () {
  this.constructor.getAverageCost(this.bootcamp);
});

//call getAverageCost defore remove
CourseSchema.pre("remove", function () {
  this.constructor.getAverageCost(this.bootcamp);
});

module.exports = mongoose.model("Course", CourseSchema);
