const jwt = require("jsonwebtoken");
const asyncHandler = require("./async");
const errorResponse = require("../utils/errorResponse");
const User = require("../models/User");

//protect routes
exports.protect = asyncHandler(async (req, res, next) => {
  let token;
  if (
    //set token from Bearer token in header
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    //set token from cookie
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies.token) {
    token = req.cookies.token;
  }
  //make sure token existes
  if (!token) {
    return next(new errorResponse("not authorize to access this route", 401));
  }
  try {
    //verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log(decoded);
    req.user = await User.findById(decoded.id);
    next();
  } catch (err) {
    return next(new errorResponse("not authorize to access this route", 401));
  }
});

//Grant access to specific roles
exports.autorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new errorResponse(
          "user role" + req.user.role + "is not authorized to acces this route",
          401
        )
      );
    }
    next();
  };
};
