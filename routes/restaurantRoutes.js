const express = require("express");
const router = express.Router();

const {
  createRestaurant,
  getRestaurants,
  deleteAllRestaurants,
  deactivateRestaurant,
} = require("../controllers/restaurantController");

router.post("/", createRestaurant);
router.get("/", getRestaurants);
router.delete("/", deleteAllRestaurants);
router.delete("/:id", deactivateRestaurant);

module.exports = router;