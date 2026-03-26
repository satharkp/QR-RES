const Order = require("../models/Order");
const MenuItem = require("../models/MenuItem");
const asyncHandler = require("../utils/asyncHandler");
const mongoose = require("mongoose");

// Get overview stats: total revenue, order count, avg order value
exports.getOverviewStats = asyncHandler(async (req, res) => {
  const restaurantId = req.user.restaurantId;

  const stats = await Order.aggregate([
    { $match: { restaurantId: new mongoose.Types.ObjectId(restaurantId), status: { $ne: "PAYMENT_PENDING" } } },
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: "$total" },
        orderCount: { $sum: 1 },
      },
    },
  ]);

  const overview = stats.length > 0 ? stats[0] : { totalRevenue: 0, orderCount: 0 };
  overview.avgOrderValue = overview.orderCount > 0 ? (overview.totalRevenue / overview.orderCount).toFixed(2) : 0;

  // Get today's sales
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todayStats = await Order.aggregate([
    {
      $match: {
        restaurantId: new mongoose.Types.ObjectId(restaurantId),
        status: { $ne: "PAYMENT_PENDING" },
        createdAt: { $gte: today },
      },
    },
    {
      $group: {
        _id: null,
        todayRevenue: { $sum: "$total" },
        todayOrderCount: { $sum: 1 },
      },
    },
  ]);

  res.json({
    ...overview,
    todayRevenue: todayStats.length > 0 ? todayStats[0].todayRevenue : 0,
    todayOrderCount: todayStats.length > 0 ? todayStats[0].todayOrderCount : 0,
  });
});

// Get top 5 popular items
exports.getPopularItems = asyncHandler(async (req, res) => {
  const restaurantId = req.user.restaurantId;

  const popular = await Order.aggregate([
    { $match: { restaurantId: new mongoose.Types.ObjectId(restaurantId), status: { $ne: "PAYMENT_PENDING" } } },
    { $unwind: "$items" },
    {
      $group: {
        _id: "$items.menuItemId",
        name: { $first: "$items.name" },
        quantitySold: { $sum: "$items.quantity" },
        revenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } },
      },
    },
    { $sort: { quantitySold: -1 } },
    { $limit: 5 },
  ]);

  res.json(popular);
});

// Get operational stats: source and status distribution
exports.getOperationalStats = asyncHandler(async (req, res) => {
  const restaurantId = req.user.restaurantId;

  const sourceStats = await Order.aggregate([
    { $match: { restaurantId: new mongoose.Types.ObjectId(restaurantId) } },
    {
      $group: {
        _id: "$orderSource",
        count: { $sum: 1 },
      },
    },
  ]);

  const statusStats = await Order.aggregate([
    { $match: { restaurantId: new mongoose.Types.ObjectId(restaurantId) } },
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 },
      },
    },
  ]);

  res.json({
    sources: sourceStats,
    statuses: statusStats,
  });
});
