const mongoose = require("mongoose");


const menuItemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },

    measurementType: {
      type: String,
      enum: ["UNIT", "PORTION"],
      default: "UNIT",
    },

    price: {
      type: Number,
    },

    portions: [
      {
        label: String,
        price: Number,
      },
    ],

    category: {
      type: String,
      required: true,
    },

    prepTime: {
      type: Number,
      default: 10,
    },

    image: {
      type: String,
    },

    available: {
      type: Boolean,
      default: true,
    },

    restaurantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("MenuItem", menuItemSchema);