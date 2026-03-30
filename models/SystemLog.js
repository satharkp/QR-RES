const mongoose = require("mongoose");

const logSchema = new mongoose.Schema(
  {
    action: {
      type: String,
      required: true,
    },
    restaurantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
    },
    message: String,
  },
  { timestamps: true }
);

module.exports =
  mongoose.models.SystemLog ||
  mongoose.model("SystemLog", logSchema);