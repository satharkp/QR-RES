const express = require("express");
const router = express.Router();
const Restaurant = require("../models/restaurantModel");
const asyncHandler = require("../utils/asyncHandler");

const User = require("../models/User");
const MenuItem = require("../models/MenuItem");
const Table = require("../models/tableModel");
const Order = require("../models/Order");

router.delete(
  "/permanent/:id",
  asyncHandler(async (req, res) => {
    const restaurant = await Restaurant.findById(req.params.id);

    if (!restaurant) {
      res.status(404);
      throw new Error("Restaurant not found");
    }

    const restaurantId = restaurant._id;

    // Remove related data
    await MenuItem.deleteMany({ restaurantId });
    await Table.deleteMany({ restaurantId });
    await User.deleteMany({ restaurantId });

    // Optional: keep order history
    // await Order.deleteMany({ restaurantId });

    await restaurant.deleteOne();

    res.json({ message: "Restaurant permanently deleted" });
  })
);

module.exports = router;