const ErrorResponse = require("../utils/errorResponse");
const errorHandler = (err, req, res, next) => {
  //log to console for developper
  //console.log(err.stack.red);
  console.log(err);
  // console.log(err.name);
  //Mongoose bad Object id
  let error = { ...err };
  error.message = err.message;
  if (err.name === "CastError") {
    const message = "resource not found";
    error = new ErrorResponse(message, 404);
  }

  //mongoose duplicate key
  if (err.code === 11000) {
    const message = "Duplicate field value entered";
    error = new ErrorResponse(message, 400);
  }

  //Mongoose validation error
  if (err.name === "validationError") {
    const message = Object.values(err.error).map((val) => val.message);
    error = new ErrorResponse(message, 400);
  }

  res.status(error.statusCode || 500).json({
    success: false,
    error: error.message || "server Error",
  });
};

module.exports = errorHandler;
