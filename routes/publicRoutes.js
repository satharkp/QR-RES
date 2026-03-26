const express = require("express");
const router = express.Router();

const {
  getMenuByTable,
  getMenuByRestaurant,
  createPublicOrder,
  callWaiter,
} = require("../controllers/publicController");

router.get("/table/:tableId", getMenuByTable);
router.get("/menu/:restaurantId", getMenuByRestaurant);
router.post("/order", createPublicOrder);
router.post("/call-waiter", callWaiter);

module.exports = router;