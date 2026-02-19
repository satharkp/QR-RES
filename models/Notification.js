const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    restaurantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
    },
    tableNumber: {
      type: Number,
      required: true,
    },
    type: {
      type: String,
      default: "WAITER_CALL",
    },
    status: {
      type: String,
      enum: ["PENDING", "ACKNOWLEDGED"],
      default: "PENDING",
    },
    acknowledgedAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Notification", notificationSchema);
