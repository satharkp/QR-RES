const express = require("express");
const router = express.Router();

const protect = require("../middlewares/authMiddleware");
const allowRoles = require("../middlewares/roleMiddleware");
const checkRestaurantActive = require("../middlewares/checkRestaurantActive");

const {
  createWaiter,
  getWaiters,
  assignTablesToWaiter,
  clearWaiterTables,
  deleteWaiter,
  getMyAssignedTables,
  createStaff,
  getStaff,
  deleteStaff,

} = require("../controllers/userController");

router.post("/waiter", protect, checkRestaurantActive, allowRoles("admin"), createWaiter);
router.get("/waiters", protect, checkRestaurantActive, allowRoles("admin"), getWaiters);
router.patch("/waiters/:id/tables", protect, checkRestaurantActive, allowRoles("admin"), assignTablesToWaiter);
router.patch("/waiters/:id/clear-tables", protect, checkRestaurantActive, allowRoles("admin"), clearWaiterTables);
router.delete("/waiters/:id", protect, checkRestaurantActive, allowRoles("admin"), deleteWaiter);
router.get("/waiter/me/tables", protect, checkRestaurantActive, allowRoles("waiter"), getMyAssignedTables);
router.post("/staff", protect, checkRestaurantActive, allowRoles("admin"), createStaff);
router.get("/staff", protect, checkRestaurantActive, allowRoles("admin"), getStaff);
router.delete("/staff/:id", protect, checkRestaurantActive, allowRoles("admin"), deleteStaff);

module.exports = router;