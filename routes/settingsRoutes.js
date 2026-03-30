const express = require("express");
const router = express.Router();
const { getSettings, updateSettings } = require("../controllers/settingsController");
const protect = require("../middlewares/authMiddleware");
const checkRestaurantActive = require("../middlewares/checkRestaurantActive");

router.route("/")
  .get(protect, checkRestaurantActive, getSettings)
  .put(protect, checkRestaurantActive, updateSettings);

module.exports = router;
