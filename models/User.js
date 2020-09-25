const crypto = require("crypto");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "please add user name"],
  },
  email: {
    type: String,
    required: [true, "please add your email"],
    unique: true,
  },
  role: {
    type: String,
    enum: ["user", "publisher"],
    default: "user",
  },
  password: {
    type: String,
    required: [true, "please add your password"],
    minlength: 6,
    select: false,
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  createAt: {
    type: Date,
    default: Date.now,
  },
});

//encrypte the password using bscrypt
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

//sign JWT and return
UserSchema.methods.getSignedJwtToken = function () {
  return jwt.sign({ id: this.id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

//Match user antered password to hashed password in database
UserSchema.methods.matchPassword = async function (entredPassword) {
  return await bcrypt.compare(entredPassword, this.password);
};

//generate and hash password token
UserSchema.methods.getResetPasswordToken = function () {
  //generate to token
  const resetToken = crypto.randomBytes(20).toString("hex");

  //hash token and set to resetPasswordTokenField
  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  //set the expires
  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

module.exports = mongoose.model("User", UserSchema);
