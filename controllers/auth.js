const User = require("../models/User");
const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");
const sentEmail = require("../utils/sendEmail");
const crypto = require("crypto");
const { token } = require("morgan");

//@desc         Register User
//@route        POST api/v1/auth/register
//@accees       Public
exports.register = asyncHandler(async (req, res, next) => {
  const { name, email, password, role } = req.body;
  //create user
  const user = await User.create({
    name,
    email,
    password,
    role,
  });

  //create token
  /*const token = user.getSignedJwtToken();

  res.status(201).json({ success: true, token });*/
  sendTokenResponse(user, 200, res);
});

//@desc         Login User
//@route        POST api/v1/auth/login
//@accees       Private
exports.login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  //Validate email and password
  if (!email || !password) {
    return next(new ErrorResponse("please provide an email and password", 400));
  }
  //check for user
  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    return next(new ErrorResponse("Invalid credentials", 401));
  }

  //check if password matches
  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    return next(new ErrorResponse("Invalid credentials", 401));
  }

  /*create token
  const token = user.getSignedJwtToken();

  res.status(201).json({ success: true, token });*/
  sendTokenResponse(user, 200, res);
});

//Get token from the model,creat cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
  //create token
  const token = user.getSignedJwtToken();

  const options = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };

  if (process.env.NODE_ENV === "production") {
    options.serure = true;
  }

  res.status(statusCode).cookie("token", token, options).json({
    success: true,
    token,
  });
};

//@desc         log user out /clear cookie
//@route        Get api/v1/auth/logout
//@accees       Private
exports.logout = asyncHandler(async (req, res, next) => {
  res.cookie("token", "none", {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });

  res.status(200).json({
    success: true,
    data: {},
  });
});

//@desc         Get current logged in user
//@route        POST api/v1/auth/me
//@accees       Private
exports.getMe = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  res.status(200).json({
    success: true,
    data: user,
  });
});

//@desc         Update user details
//@route        PUT api/v1/auth/updatedetails
//@accees       Private
exports.updateDetails = asyncHandler(async (req, res, next) => {
  const fieldsToUpdate = {
    name: req.body.name,
    email: req.body.email,
  };

  const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
    new: true,
    runValidators: true,
  });
  res.status(200).json({
    success: true,
    data: user,
  });
});

//@desc         update the password
//@route        PUT api/v1/auth/updatepassword
//@accees       Private
exports.updatePassword = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id).select("+password");
  //check current password
  if (!(await user.matchPassword(req.body.currentPassword))) {
    return next(new ErrorResponse("password is incorrect", 401));
  }

  user.password = req.body.newPassword;
  await user.save();

  sendTokenResponse(user, 200, res);
});

//@desc         Forgot password
//@route        POST api/v1/auth/forgotpassword
//@accees       Public
exports.forgotPassword = asyncHandler(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new ErrorResponse("there is no user with that email", 404));
  }
  //get reset token
  const resetToken = user.getResetPasswordToken();

  await user.save({ validateBeforeSave: false });

  //create reset uri
  const resetUrl =
    req.protocol +
    "://" +
    req.get("host") +
    "/api/v1/auth/resetpassword/" +
    resetToken;

  //create a message
  const message =
    "you are receving this email because you (or someone else) has requested the reset of a password. please make a put request to: \n\n " +
    resetUrl;

  try {
    await sentEmail({
      email: user.email,
      subject: "password reset token",
      message,
    });
    res.status(200).json({ success: true, data: "Email sent" });
  } catch (err) {
    console.log(err);
    user.ResetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save({ validateBeforeSave: false });
    return next(new ErrorResponse("Email could not be sent,", 500));
  }

  res.status(200).json({
    success: true,
    data: user,
  });
});

//@desc         Rest passwort
//@route        PUT api/v1/auth/resetpassword/:token
//@accees       Public
exports.resetPassword = asyncHandler(async (req, res, next) => {
  //Get hashed token
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });
  //check if user exist
  if (!user) {
    return next(new ErrorResponse("Invalid token", 400));
  }
  //set new password
  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();
  sendTokenResponse(user, 200, res);
});
