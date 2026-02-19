const express = require("express");
const router = express.Router();

const {
  bulkCreateTables,
  getTablesByRestaurant,
  createTable,
  deleteTable,
  deleteRestaurantTables,
} = require("../controllers/tableController");

router.post("/bulk", bulkCreateTables);
router.get("/:restaurantId", getTablesByRestaurant);
router.post("/", createTable);
router.delete("/:id", deleteTable);
router.delete("/restaurant/:restaurantId", deleteRestaurantTables);

module.exports = router;