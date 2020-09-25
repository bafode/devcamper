const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");
const User = require("../models/User");
const advancedResults = require("../middleware/advancedResults");

//@desc         Get all user
//@route        Get api/v1/auth/users
//@accees       PrivatAdmin
exports.getUsers = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedResults);
});

//@desc         Get sngle user
//@route        Get api/v1/auth/users/:id
//@accees       PrivatAdmin
exports.getUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  res.status(200).json({
    success: true,
    data: user,
  });
});

//@desc         Create new user
//@route        POST api/v1/auth/users/
//@accees       Privat/Admin
exports.createUser = asyncHandler(async (req, res, next) => {
  const user = await User.create(req.body);
  res.status(200).json({
    success: true,
    data: user,
  });
});

//@desc         Update user
//@route        PUT api/v1/auth/users/:id
//@accees       Privat/Admin
exports.updateUser = asyncHandler(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  res.status(200).json({
    success: true,
    data: user,
  });
});
//@desc         delete user
//@route        DELETE api/v1/auth/users/:id
//@accees       Privat/Admin
exports.deleteUser = asyncHandler(async (req, res, next) => {
  const user = await User.findByIdAndDelete(req.params.id);
  res.status(200).json({
    success: true,
    data: {},
  });
});
