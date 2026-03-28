const mongoose = require("mongoose");
const MenuItem = require("./MenuItem");
const Table = require("./tableModel");


const restaurantSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    domain: String,
    currency: {
      type: String,
      default: "INR",
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    settings: {
      themeColor: { type: String, default: "#10b981" },
      font: { type: String, default: "Playfair Display" },
      logo: { type: String, default: "" },
      currency: { type: String, default: "INR" },
      features: {
        onlinePayment: { type: Boolean, default: true },
        cashPayment: { type: Boolean, default: true },
        waiterCall: { type: Boolean, default: true },
        ratings: { type: Boolean, default: false },
      },
    },

    subscriptionStatus: {
      type: String,
      enum: ["ACTIVE", "PAST_DUE", "CANCELLED"],
      default: "ACTIVE",
    },

    subscriptionEndsAt: Date,
    trialEndsAt: Date,
  },
  { timestamps: true }
);


restaurantSchema.pre(
  "deleteOne",
  { document: true, query: false },
  async function () {
    await MenuItem.deleteMany({ restaurantId: this._id });
    await Table.deleteMany({ restaurantId: this._id });
  }
);

module.exports = mongoose.model("Restaurant", restaurantSchema);