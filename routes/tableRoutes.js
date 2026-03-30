const express = require("express");
const router = express.Router();

const protect = require("../middlewares/authMiddleware");
const checkRestaurantActive = require("../middlewares/checkRestaurantActive");
const {
  bulkCreateTables,
  getTablesByRestaurant,
  createTable,
  deleteTable,
  deleteRestaurantTables,
} = require("../controllers/tableController");

router.post("/bulk", protect, checkRestaurantActive, bulkCreateTables);
router.get("/:restaurantId", getTablesByRestaurant);
router.post("/", protect, checkRestaurantActive, createTable);
router.delete("/:id", protect, checkRestaurantActive, deleteTable);
router.delete(
  "/restaurant/:restaurantId",
  protect,
  checkRestaurantActive,
  deleteRestaurantTables
);

module.exports = router;