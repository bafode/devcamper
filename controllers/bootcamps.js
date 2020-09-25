const path = require("path");
const Bootcamp = require("../models/Bootcamp");
const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");
const geocoder = require("../utils/geocoder");
const advancedResults = require("../middleware/advancedResults");

//@desc         Get all bootcamps
//@route        Get api/v1/bootcamps
//@accees       Public
exports.getBootcamps = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.find();
  res.status(200).json(res.advancedResults);
});

//@desc         Get single bootcamps
//@route        Get api/v1/bootcamps/:id
//@accees       Public
exports.getBootcamp = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findById(req.params.id);
  if (!bootcamp) {
    // return res.status(400).json({ success: false });
    return next(
      new ErrorResponse("Bootcamp not fount with id of " + req.params.id, 400)
    );
  }
  res.status(200).json({ success: true, data: bootcamp });
});

//@desc         create new bootcamps
//@route        POST api/v1/bootcamps/
//@accees       Private
exports.createBootcamp = asyncHandler(async (req, res, next) => {
  //add user to req,body
  req.body.user = req.user.id;

  //check for published bootcamp
  const publishedBootcamp = await Bootcamp.findOne({ user: req.user.id });
  //if the user is not an admin they can only add on bootcamp
  if (publishedBootcamp && req.user.role !== "admin") {
    return next(
      new ErrorResponse(
        "the user with id:" + req.user.id + "has already published a bootcamp",
        400
      )
    );
  }

  const bootcamp = await Bootcamp.create(req.body);
  res
    .status(201)
    .json({ success: true, msg: "create a new bootcamps", data: bootcamp });
});

//@desc         Update bootcamps
//@route        PUT api/v1/bootcamps/:id
//@accees       Private
exports.updateBootcamp = asyncHandler(async (req, res, next) => {
  let bootcamp = await Bootcamp.findById(req.params.id);
  if (!bootcamp) {
    return next(
      new ErrorResponse("Bootcamp not fount with id of " + req.params.id, 400)
    );
  }
  //make sure user is bootcamps owner
  if (bootcamp.user.toString() !== req.user.id && req.user.role !== "admin") {
    return next(
      new ErrorResponse(
        "User " + req.params.id + "is not authorized to update this bootcamp",
        401
      )
    );
  }

  bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  res.status(200).json({ success: true, data: bootcamp });
});

//@desc         Delete bootcamps
//@route        DELETE api/v1/bootcamps/:id
//@accees       Public
exports.deleteBootcamp = asyncHandler(async (req, res, next) => {
  let bootcamp = await Bootcamp.findById(req.params.id);
  //const bootcamp = await Bootcamp.findByIdAndDelete(req.params.id);
  if (!bootcamp) {
    // return res.status(400).json({ success: true });
    return next(
      new ErrorResponse("Bootcamp not fount with id of " + req.params.id, 400)
    );
  }

  //make sure user is bootcamps owner
  if (bootcamp.user.toString() !== req.user.id && req.user.role !== "admin") {
    return next(
      new ErrorResponse(
        "User " + req.params.id + "is not authorized to delete this bootcamp",
        401
      )
    );
  }

  bootcamp.remove();
  res.status(200).json({ success: true, data: {} });
});

//@desc         Get bootcamps within radius
//@route        Get api/v1/bootcamps/radius/:zipcode/:distance
//@accees       Public
exports.getBootcampInRadius = asyncHandler(async (req, res, next) => {
  const { zipcode, distance } = req.params;
  //get lat/lng from geocoder
  const loc = await geocoder.geocode(zipcode);
  const lat = loc[0].latitude;
  const lng = loc[0].longitude;

  //calcul radius using radians
  //Divid distance by radius of Earth
  //Earth radius=3963 mi /6378km
  const radius = distance / 3963;
  const bootcamps = await Bootcamp.find({
    location: { $geoWithin: { $centerSphere: [[lat, lng], radius] } },
  });
  res.status(200).json({
    success: true,
    count: bootcamps.length,
    data: bootcamps,
  });
});

//@desc         Upload photo for bootcamp
//@route        put api/v1/bootcamps/:id/:photo
//@accees       Private
exports.bootcampPhotoUpload = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findById(req.params.id);
  if (!bootcamp) {
    return next(
      new ErrorResponse("Bootcamp not fount with id of " + req.params.id, 400)
    );
  }
  //make sure user is bootcamps owner
  if (bootcamp.user.toString() !== req.user.id && req.user.role !== "admin") {
    return next(
      new ErrorResponse(
        "User " + req.params.id + "is not authorized to update this bootcamp",
        401
      )
    );
  }

  if (!req.files) {
    return next(new ErrorResponse("Please upload the file", 400));
  }
  const file = req.files.file;
  //make sure the image is a photo
  if (!file.mimetype.startsWith("image")) {
    return next(new ErrorResponse("Please upload an image file", 400));
  }
  //check file size
  if (file.size > process.env.MAX_FILE_UPLOAD) {
    return next(
      new ErrorResponse(
        "Please upload an image less than " + process.env.MAX_FILE_UPLOAD,
        400
      )
    );
  }
  //create custom file name
  file.name = "photo" + bootcamp._id + "" + path.parse(file.name).ext;
  //console.log(file.name);
  file.mv(process.env.FILE_UPLOAD_PATH + "/" + file.name, async (err) => {
    if (err) {
      console.error(err);
      return next(new ErrorResponse("problem with file upload ", 400));
    }
    await Bootcamp.findByIdAndUpdate(req.params.id, { photo: file.name });
    res.status(200).json({
      success: true,
      data: file.name,
    });
  });
});
