const express = require("express");
const router = express.Router();

const protect = require("../middlewares/authMiddleware");
const allowRoles = require("../middlewares/roleMiddleware");

const {
  createWaiter,
  getWaiters,
  assignTablesToWaiter,
  clearWaiterTables,
  deleteWaiter,
  getMyAssignedTables,

} = require("../controllers/userController");

router.post("/waiter", protect, allowRoles("admin"), createWaiter);
router.get("/waiters", protect, allowRoles("admin"), getWaiters);
router.patch("/waiters/:id/tables", protect, allowRoles("admin"), assignTablesToWaiter);
router.patch("/waiters/:id/clear-tables",protect, allowRoles ("admin"), clearWaiterTables);
router.delete("/waiters/:id", protect, allowRoles("admin"), deleteWaiter );
router.get("/waiter/me/tables", protect, allowRoles("waiter"), getMyAssignedTables );

module.exports = router;