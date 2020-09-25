const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");
const Score = require("../models/Score");
const Bootcamp = require("../models/Bootcamp");

//@desc         Get all scores
//@route        Get api/v1/bootcamps/:bootcampId/scores
//@accees       Public
exports.getScores = asyncHandler(async (req, res, next) => {
  if (req.params.bootcampId) {
    const scores = await Score.find({ bootcamp: req.params.bootcampId });
    res
      .status(200)
      .json({ success: true, count: reviews.length, data: scores });
  } else {
    res.status(200).json(res.advancedResults);
  }
});

//@desc         Get single score
//@route        Get api/v1/scores/:id
//@accees       Private
exports.getScore = asyncHandler(async (req, res, next) => {
  const score = await Score.findById(req.params.id).populate({
    path: "bootcamp",
    select: "name description",
  });
  if (!score) {
    return next(
      new ErrorResponse("no score found with id of " + req.params.id, 404)
    );
  }

  res.status(200).json({ success: true, data: score });
});

//@desc         add a score for a bootcamps review
//@route        Get api/v1//bootcamps/:bootcampId/score
//@accees       Private
exports.createScore = asyncHandler(async (req, res, next) => {
  req.body.bootcamp = req.params.bootcampId;
  req.body.user = req.user.id;
  const bootcamp = await Bootcamp.findById(req.params.bootcampId);

  //check for bootcamp
  if (!bootcamp) {
    return next(
      new ErrorResponse(
        "no bootcamps found with the id " + req.params.bootcampId,
        404
      )
    );
  }
  //create the score
  const score = await Score.create(req.body);
  res.status(201).json({
    success: true,
    data: score,
  });
});

//@desc         update score
//@route        PUT api/v1/scores/:id
//@accees       Private
exports.updateScore = asyncHandler(async (req, res, next) => {
  let score = await Score.findById(req.params.id);

  //check for score
  if (!score) {
    return next(
      new ErrorResponse(
        "no score found with the id " + req.params.bootcampId,
        404
      )
    );
  }
  //make sure score belongs to user or user is the admin
  if (score.user.toString() !== req.user.id && req.user.role !== "admin") {
    return next(new ErrorResponse("no authorize to update score", 401));
  }

  score = await Score.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  res.status(200).json({
    success: true,
    data: score,
  });
});

//@desc         remove score
//@route        DELETE api/v1/scores/:id
//@accees       Private
exports.deleteScore = asyncHandler(async (req, res, next) => {
  const score = await Score.findById(req.params.id);

  //check for score
  if (!score) {
    return next(
      new ErrorResponse(
        "no score found with the id " + req.params.bootcampId,
        404
      )
    );
  }
  //make sure review belongs to user or user is the admin
  if (score.user.toString() !== req.user.id && req.user.role !== "admin") {
    return next(new ErrorResponse("no authorize to update review", 401));
  }

  review.remove();
  res.status(200).json({
    success: true,
    data: {},
  });
});
