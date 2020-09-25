const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");
const Course = require("../models/Course");
const Bootcamp = require("../models/Bootcamp");

//@desc         Get all courses
//@route        Get api/v1/bootcamps/:bootcampId/course
//@accees       Public
exports.getCoures = asyncHandler(async (req, res, next) => {
  //let query;

  if (req.params.bootcampId) {
    // query = Course.find({ bootcamp: req.params.bootcampId });
    const courses = await Course.find({ bootcamp: req.params.bootcampId });
    res
      .status(200)
      .json({ success: true, count: courses.length, data: courses });
  } else {
    res.status(200).json(res.advancedResults);
  }
  /*else {
    query = Course.find().populate({
      path: "bootcamp",
      select: "name description",
    });
  }

  const courses = await query;

  res.status(200).json({ success: true, count: courses.length, data: courses });*/
});

//@desc         Get Single courses
//@route        Get api/v1/courses/:id
//@accees       Private
exports.getCoure = asyncHandler(async (req, res, next) => {
  const course = await Course.findById(req.params.id).populate({
    path: "bootcamp",
    select: "name description",
  });
  if (!course) {
    return new ErrorResponse("No course with the id of " + req.params.id, 404);
  }

  res.status(200).json({ success: true, data: course });
});

//@desc         Add course
//@route        POST api/v1/bootcamps/:bootcampId/courses
//@accees       Private
exports.addCourse = asyncHandler(async (req, res, next) => {
  req.body.bootcamp = req.params.id;
  req.body.user = req.user.id;
  const bootcamp = await Bootcamp.findById(req.params.bootcampId);

  if (!bootcamp) {
    return new new ErrorResponse(
      "No bootcamp with the id of " + req.params.bootcampId,
      404
    )();
  }

  //make sure user is bootcamps owner
  if (bootcamp.user.toString() !== req.user.id && req.user.role !== "admin") {
    return next(
      new ErrorResponse(
        "User " +
          req.params.id +
          "is not authorized to add a course to  bootcamp" +
          bootcamp._id,
        401
      )
    );
  }

  const course = await Course.create(req.body);
  res.status(200).json({ success: true, data: course });
});

//@desc         Update course
//@route        POST api/v1/courses/:id
//@accees       Private
exports.updateCourse = asyncHandler(async (req, res, next) => {
  let course = await Course.findById(req.params.id);

  if (!course) {
    return new ErrorResponse("No course with the id of " + req.params.id, 404);
  }

  //make sure user is bootcamps owner
  if (course.user.toString() !== req.user.id && req.user.role !== "admin") {
    return next(
      new ErrorResponse(
        "User " +
          req.params.id +
          "is not authorized to this course with id" +
          course._id,
        401
      )
    );
  }

  course = await Course.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  res.status(200).json({ success: true, data: course });
});

//@desc         Delete course
//@route        Delete api/v1/courses/:id
//@accees       Private
exports.deleteCourse = asyncHandler(async (req, res, next) => {
  const course = await Course.findById(req.params.id);

  if (!course) {
    return new ErrorResponse("No course with the id of " + req.params.id, 404);
  }
  //make sure user is bootcamps owner
  if (course.user.toString() !== req.user.id && req.user.role !== "admin") {
    return next(
      new ErrorResponse(
        "User " +
          req.params.id +
          "is not authorized to delete the course with id" +
          course._id,
        401
      )
    );
  }
  await course.remove();
  res.status(200).json({ success: true, message: "course deleted", data: {} });
});
