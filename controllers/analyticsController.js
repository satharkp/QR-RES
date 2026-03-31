const Order = require("../models/Order");
const MenuItem = require("../models/MenuItem");
const asyncHandler = require("../utils/asyncHandler");
const mongoose = require("mongoose");

const getDateFilter = (query) => {
  const { range, from, to } = query;

  if (range === "today") {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    return { $gte: start };
  }

  if (range === "7d") {
    const start = new Date();
    start.setDate(start.getDate() - 7);
    return { $gte: start };
  }

  if (range === "30d") {
    const start = new Date();
    start.setDate(start.getDate() - 30);
    return { $gte: start };
  }

  if (range === "custom" && from && to) {
    return {
      $gte: new Date(from),
      $lte: new Date(to),
    };
  }

  return {}; // no filter
};

// Get overview stats: total revenue, order count, avg order value
exports.getOverviewStats = asyncHandler(async (req, res) => {
  const restaurantId = req.user.restaurantId;
  const dateFilter = getDateFilter(req.query);

  const stats = await Order.aggregate([
    {
      $match: {
        restaurantId: new mongoose.Types.ObjectId(restaurantId),
        status: { $ne: "PAYMENT_PENDING" },
        ...(Object.keys(dateFilter).length && { createdAt: dateFilter }),
      },
    },
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
  const dateFilter = getDateFilter(req.query);

  const popular = await Order.aggregate([
    {
      $match: {
        restaurantId: new mongoose.Types.ObjectId(restaurantId),
        status: { $ne: "PAYMENT_PENDING" },
        ...(Object.keys(dateFilter).length && { createdAt: dateFilter }),
      },
    },
    { $unwind: "$items" },
    {
      $group: {
        _id: "$items.name",
        count: { $sum: "$items.quantity" },
      },
    },
    { $sort: { count: -1 } },
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

exports.getTrends = asyncHandler(async (req, res) => {
  const restaurantId = req.user.restaurantId;
  const dateFilter = getDateFilter(req.query);

  const trends = await Order.aggregate([
    {
      $match: {
        restaurantId: new mongoose.Types.ObjectId(restaurantId),
        status: { $ne: "PAYMENT_PENDING" },
        ...(Object.keys(dateFilter).length && { createdAt: dateFilter }),
      },
    },
    {
      $group: {
        _id: {
          $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
        },
        revenue: { $sum: "$total" },
        orders: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  res.json(trends);
});