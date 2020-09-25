const express = require("express");

//implamenting of advanced middleware
const User = require("../models/User");

const {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
} = require("../controllers/users");

const router = express.Router({ mergeParams: true });

//protect middleware
const advancedResults = require("../middleware/advancedResults");
const { protect, autorize } = require("../middleware/auth");

router.use(protect);
router.use(autorize("admin"));

router.route("/").get(advancedResults(User), getUsers).post(createUser);
router.route("/:id").get(getUser).put(updateUser).delete(deleteUser);

module.exports = router;
