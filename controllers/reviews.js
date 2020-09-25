const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");
const Review = require("../models/Review");
const Bootcamp = require("../models/Bootcamp");

//@desc         Get all reviews
//@route        Get api/v1/bootcamps/:bootcampId/reviws
//@accees       Public
exports.getReviews = asyncHandler(async (req, res, next) => {
  if (req.params.bootcampId) {
    const reviews = await Review.find({ bootcamp: req.params.bootcampId });
    res
      .status(200)
      .json({ success: true, count: reviews.length, data: reviews });
  } else {
    res.status(200).json(res.advancedResults);
  }
});

//@desc         Get single reviews
//@route        Get api/v1/reviws/:id
//@accees       Private
exports.getReview = asyncHandler(async (req, res, next) => {
  const review = await Review.findById(req.params.id).populate({
    path: "bootcamp",
    select: "name description",
  });
  if (!review) {
    return next(
      new ErrorResponse("no review found with id of " + req.params.id, 404)
    );
  }

  res.status(200).json({ success: true, data: review });
});

//@desc         add a review for a bootcamps review
//@route        Get api/v1//bootcamps/:bootcampId/reviews
//@accees       Private
exports.createReview = asyncHandler(async (req, res, next) => {
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
  //create the review
  const review = await Review.create(req.body);
  res.status(201).json({
    success: true,
    data: review,
  });
});

//@desc         update review
//@route        PUT api/v1/reviews/:id
//@accees       Private
exports.updateReview = asyncHandler(async (req, res, next) => {
  let review = await Review.findById(req.params.id);

  //check for bootcamp
  if (!review) {
    return next(
      new ErrorResponse(
        "no review found with the id " + req.params.bootcampId,
        404
      )
    );
  }
  //make sure review belongs to user or user is the admin
  if (review.user.toString() !== req.user.id && req.user.role !== "admin") {
    return next(new ErrorResponse("no authorize to update review", 401));
  }

  review = await Review.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  res.status(200).json({
    success: true,
    data: review,
  });
});

//@desc         remove review
//@route        DELETE api/v1/reviews/:id
//@accees       Private
exports.deleteReview = asyncHandler(async (req, res, next) => {
  const review = await Review.findById(req.params.id);

  //check for review
  if (!review) {
    return next(
      new ErrorResponse(
        "no review found with the id " + req.params.bootcampId,
        404
      )
    );
  }
  //make sure review belongs to user or user is the admin
  if (review.user.toString() !== req.user.id && req.user.role !== "admin") {
    return next(new ErrorResponse("no authorize to update review", 401));
  }

  review.remove();
  res.status(200).json({
    success: true,
    data: {},
  });
});
