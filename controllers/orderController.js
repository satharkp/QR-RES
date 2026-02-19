const Order = require("../models/Order");
const MenuItem = require("../models/MenuItem");
const User = require("../models/User");
const Table = require("../models/tableModel");
const asyncHandler = require("../utils/asyncHandler");
const { createOrderSchema } = require("../validators/orderValidator");
const { validateOrderItems } = require("../utils/orderValidation");

// Create order
exports.createOrder = asyncHandler(async (req, res) => {
  createOrderSchema.parse(req.body);

  const { restaurantId, tableNumber, items, total, paymentMethod, orderSource } = req.body;

  let status = "PLACED";

  if (orderSource === "QR" && paymentMethod === "CASH") {
    status = "PENDING_CONFIRMATION";
  }

  const menuItems = await validateOrderItems(items, restaurantId);

  const estimatedWaitTime = Math.max(
    ...menuItems.map((m) => m.prepTime || 0),
    0
  );

  const order = await Order.create({
    restaurantId,
    tableNumber,
    items,
    total,
    paymentMethod,
    orderSource,
    status,
    estimatedWaitTime,
    confirmedByWaiter: orderSource === "WAITER",
  });

  // Emit realtime event for kitchen dashboards
  const io = req.app.get("io");
  io.to(`restaurant_${restaurantId}`).emit("new-order", order);

  res.status(201).json(order);
});

// Waiter dashboard
exports.getWaiterOrders = asyncHandler(async (req, res) => {
  const waiter = await User.findById(req.user._id);

  if (!waiter) {
    return res.status(404).json({ message: "Waiter not found" });
  }

  const tables = await Table.find({ _id: { $in: waiter.assignedTables } });
  const tableNumbers = tables.map((t) => t.tableNumber);

  const orders = await Order.find({
    restaurantId: req.user.restaurantId,
    tableNumber: { $in: tableNumbers },
  }).sort({ createdAt: -1 });

  res.json(orders);
});

// Kitchen dashboard
exports.getKitchenOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({
    restaurantId: req.user.restaurantId,
    status: { $in: ["PLACED", "PREPARING", "READY"] },
  }).sort({ createdAt: 1 });

  res.json(orders);
});

// Get orders by restaurant
exports.getOrdersByRestaurant = asyncHandler(async (req, res) => {
  const orders = await Order.find({
    restaurantId: req.params.restaurantId,
  }).sort({ createdAt: -1 });

  res.json(orders);
});

// Update status
exports.updateOrderStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const order = await Order.findById(req.params.id);

  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  const role = req.user.role;

  if (role === "kitchen") {
    if (
      (order.status === "PLACED" && status === "PREPARING") ||
      (order.status === "PREPARING" && status === "READY")
    ) {
      order.status = status;
    } else {
      return res.status(403).json({ message: "Kitchen cannot perform this status change" });
    }
  } else if (role === "waiter") {
    if (order.status === "READY" && status === "SERVED") {
      order.status = status;
    } else {
      return res.status(403).json({ message: "Waiter cannot perform this status change" });
    }
  } else if (role === "admin") {
    order.status = status;
  } else {
    return res.status(403).json({ message: "Unauthorized role" });
  }

  await order.save();

  // Emit realtime order update
  const io = req.app.get("io");
  io.to(`restaurant_${order.restaurantId}`).emit("order-updated", order);

  res.json(order);
});

// Confirm QR cash order
exports.confirmOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  if (order.status !== "PENDING_CONFIRMATION") {
    return res.status(400).json({
      message: "Order does not require confirmation",
    });
  }

  order.status = "PLACED";
  order.confirmedByWaiter = true;

  await order.save();

  // Emit confirmation update
  const io = req.app.get("io");
  io.to(`restaurant_${order.restaurantId}`).emit("order-updated", order);

  res.json(order);
});

// Get order by ID
exports.getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  res.json(order);
});