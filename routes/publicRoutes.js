const express = require("express");
const router = express.Router();

const {
  getMenuByTable,
  createPublicOrder,
  callWaiter,
} = require("../controllers/publicController");

router.get("/table/:tableId", getMenuByTable);
router.post("/order", createPublicOrder);
router.post("/call-waiter", callWaiter);

module.exports = router;