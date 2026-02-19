const Restaurant = require("../models/restaurantModel");
const MenuItem = require("../models/MenuItem");
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const asyncHandler = require("../utils/asyncHandler");
const { createRestaurantSchema } = require("../validators/restaurantValidator");

// Create restaurant
exports.createRestaurant = asyncHandler(async (req, res) => {
  createRestaurantSchema.parse(req.body);
  const {
    name,
    domain,
    currency,
    adminEmail,
    adminPassword,
    kitchenEmail,
    kitchenPassword,
  } = req.body;

  const trialEndsAt = new Date();
  trialEndsAt.setMonth(trialEndsAt.getMonth() + 3);

  const restaurant = await Restaurant.create({
    name,
    domain,
    currency,
    trialEndsAt,
  });

  const hashedPassword = await bcrypt.hash(adminPassword, 10);

  await User.create({
    email: adminEmail,
    password: hashedPassword,
    role: "admin",
    restaurantId: restaurant._id,
  });

  const hashedKitchenPassword = await bcrypt.hash(
    kitchenPassword || "kitchen123",
    10
  );

  await User.create({
    email: kitchenEmail,
    password: hashedKitchenPassword,
    role: "kitchen",
    restaurantId: restaurant._id,
  });

  res.status(201).json(restaurant);
});

// Get restaurants
exports.getRestaurants = asyncHandler(async (req, res) => {
  const restaurants = await Restaurant.find();

  const restaurantCount = restaurants.length;
  const menuCount = await MenuItem.countDocuments();

  res.json({
    count: restaurantCount,
    menuItems: menuCount,
    data: restaurants,
  });
});

// Delete all restaurants
exports.deleteAllRestaurants = asyncHandler(async (req, res) => {
  await Restaurant.deleteMany({});
  res.json({ message: "All restaurants deleted" });
});

// Deactivate restaurant
exports.deactivateRestaurant = asyncHandler(async (req, res) => {
  const restaurant = await Restaurant.findById(req.params.id);

  if (!restaurant) {
    res.status(404);
    throw new Error("Restaurant not found");
  }

  restaurant.isActive = false;
  await restaurant.save();

  res.json({ message: "Restaurant deactivated" });
});