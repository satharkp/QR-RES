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
        name: {
          type: String,
          required: true,
        },
        price: {
          type: Number,
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
        },
        portion: {
          type: String,
          default: null,
        },
        menuItemId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "MenuItem",
          required: true,
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
        "PAYMENT_PENDING",
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
      enum: ["UPI", "CASH", "CARD"],
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
    isPaid: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);