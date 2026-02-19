const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
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

    items: [
      {
        name: String,
        price: Number,
        quantity: Number,
        menuItemId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "MenuItem",
        },
      },
    ],

    total: {
      type: Number,
      required: true,
    },
    
     estimatedWaitTime: {
      type: Number,
      default: 0,
    },

    status: {
      type: String,
      enum: [
        "PENDING_CONFIRMATION",
        "PLACED",
        "PREPARING",
        "READY",
        "SERVED",
      ],
      default: "PLACED",
    },

    paymentMethod: {
      type: String,
      enum: ["UPI", "CASH"],
      required: true,
    },

    orderSource: {
      type: String,
      enum: ["QR", "WAITER"],
      required: true,
    },

    confirmedByWaiter: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);