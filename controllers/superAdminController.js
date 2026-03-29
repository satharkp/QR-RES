const Restaurant = require("../models/restaurantModel");
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const asyncHandler = require("../utils/asyncHandler");

// GET all restaurants with basic stats
exports.getAllRestaurants = asyncHandler(async (req, res) => {
  const restaurants = await Restaurant.find().sort({ createdAt: -1 }).lean();
  res.json({ data: restaurants });
});

/**
 * POST create a new restaurant (super admin)
 */
exports.createRestaurant = asyncHandler(async (req, res) => {
  const { name, domain, currency, adminEmail, adminPassword } = req.body;

  if (!name || !domain || !adminEmail || !adminPassword) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const exists = await Restaurant.findOne({ domain });
  if (exists) {
    return res.status(400).json({ message: "Domain already exists" });
  }

  const restaurant = await Restaurant.create({
    name,
    domain,
    currency: currency || "INR",
    isActive: true,
    subscriptionStatus: "ACTIVE",
  });

  const hashed = await bcrypt.hash(adminPassword, 10);

  const admin = await User.create({
    email: adminEmail,
    password: hashed,
    role: "admin",
    restaurantId: restaurant._id,
    isMainAdmin: true,
  });

  res.status(201).json({
    message: "Restaurant and admin created",
    restaurant,
    admin,
  });
});

// PATCH toggle isActive
exports.toggleRestaurantActive = asyncHandler(async (req, res) => {
  const restaurant = await Restaurant.findById(req.params.id);
  if (!restaurant) return res.status(404).json({ message: "Restaurant not found" });

  restaurant.isActive = !restaurant.isActive;
  await restaurant.save();
  res.json({ message: `Restaurant ${restaurant.isActive ? "activated" : "deactivated"}`, isActive: restaurant.isActive });
});

// PATCH update subscription status
exports.updateSubscription = asyncHandler(async (req, res) => {
  const { subscriptionStatus } = req.body;
  const validStatuses = ["ACTIVE", "PAST_DUE", "CANCELLED"];
  if (!validStatuses.includes(subscriptionStatus)) {
    return res.status(400).json({ message: "Invalid subscription status" });
  }

  const restaurant = await Restaurant.findByIdAndUpdate(
    req.params.id,
    { subscriptionStatus },
    { new: true }
  );
  if (!restaurant) return res.status(404).json({ message: "Restaurant not found" });

  res.json({ message: "Subscription updated", subscriptionStatus: restaurant.subscriptionStatus });
});

// DELETE a restaurant (cascade handled by mongoose pre-hook on model)
exports.deleteRestaurant = asyncHandler(async (req, res) => {
  const restaurant = await Restaurant.findById(req.params.id);
  if (!restaurant) return res.status(404).json({ message: "Restaurant not found" });

  await restaurant.deleteOne();
  res.json({ message: "Restaurant deleted successfully" });
});
