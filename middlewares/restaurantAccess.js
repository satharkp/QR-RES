const Restaurant = require("../models/restaurantModel");

const checkRestaurantAccess = async (req, res, next) => {
  const restaurantId = req.body.restaurantId || req.params.restaurantId;

  if (!restaurantId) {
    return res.status(400).json({ message: "restaurantId is required" });
  }

  const restaurant = await Restaurant.findById(restaurantId);

  if (!restaurant) {
    return res.status(404).json({ message: "Restaurant not found" });
  }

  const now = new Date();

  const trialActive = restaurant.trialEndsAt && restaurant.trialEndsAt > now;
  const subscriptionActive = restaurant.subscriptionStatus === "ACTIVE";

  if (!restaurant.isActive || (!trialActive && !subscriptionActive)) {
    return res.status(403).json({
      message: "Restaurant subscription inactive",
    });
  }

  next();
};

module.exports = checkRestaurantAccess;