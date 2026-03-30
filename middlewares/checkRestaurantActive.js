const Restaurant = require("../models/restaurantModel");

const checkRestaurantActive = async (req, res, next) => {
  try {
    const restaurantId = req.user.restaurantId;

    if (!restaurantId) {
      return res.status(403).json({ message: "Restaurant not found" });
    }

    const restaurant = await Restaurant.findById(restaurantId);

    if (!restaurant || !restaurant.isActive) {
      return res.status(403).json({
        message: "Restaurant is deactivated",
      });
    }

    next();
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = checkRestaurantActive;