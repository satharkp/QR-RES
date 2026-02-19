const Notification = require("../models/Notification");
const asyncHandler = require("../utils/asyncHandler");

// GET all notifications for a restaurant (history)
exports.getNotifications = asyncHandler(async (req, res) => {
  const { restaurantId } = req.user;
  const notifications = await Notification.find({ restaurantId })
    .sort({ createdAt: -1 })
    .limit(50); // Limit to last 50 for performance

  res.json(notifications);
});

// PATCH acknowledge notification
exports.acknowledgeNotification = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const notification = await Notification.findByIdAndUpdate(
    id,
    { status: "ACKNOWLEDGED", acknowledgedAt: new Date() },
    { new: true }
  );

  if (!notification) {
    res.status(404);
    throw new Error("Notification not found");
  }

  res.json(notification);
});
