const Restaurant = require("../models/restaurantModel");
const asyncHandler = require("../utils/asyncHandler");

// Get settings for current restaurant
exports.getSettings = asyncHandler(async (req, res) => {
  const restaurant = await Restaurant.findById(req.user.restaurantId);

  if (!restaurant) {
    res.status(404);
    throw new Error("Restaurant not found");
  }

  // Return settings and name
  res.json({
    ...(restaurant.settings ? restaurant.settings.toObject() : {}),
    name: restaurant.name
  });
});

// Update settings for current restaurant
exports.updateSettings = asyncHandler(async (req, res) => {
  const restaurant = await Restaurant.findById(req.user.restaurantId);

  if (!restaurant) {
    res.status(404);
    throw new Error("Restaurant not found");
  }

  // Merge the updated settings with existing ones
  restaurant.settings = {
    ...restaurant.settings,
    ...req.body,
    features: {
      ...(restaurant.settings?.features || {}),
      ...(req.body.features || {}),
    },
  };

  if (req.body.name) {
    restaurant.name = req.body.name;
  }

  await restaurant.save();

  res.json({
    ...restaurant.settings.toObject(),
    name: restaurant.name
  });
});
