const express = require("express");
const router = express.Router();
const protect = require("../middlewares/authMiddleware");
const allowRoles = require("../middlewares/roleMiddleware");
const {
  getNotifications,
  acknowledgeNotification,
} = require("../controllers/notificationController");

// Get history
router.get("/", protect, allowRoles("waiter", "admin"), getNotifications);

// Acknowledge
router.patch("/:id/acknowledge", protect, allowRoles("waiter", "admin"), acknowledgeNotification);

module.exports = router;
