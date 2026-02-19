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
      default: "GBP",
    },

    isActive: {
      type: Boolean,
      default: true,
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