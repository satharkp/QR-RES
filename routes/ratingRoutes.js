const express = require("express");
const router = express.Router();
const { createRating ,getRestaurantRating} = require("../controllers/ratingController");

router.post("/", createRating);
router.get("/:restaurantId", getRestaurantRating);

module.exports = router;