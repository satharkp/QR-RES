const Table = require("../models/tableModel");
const MenuItem = require("../models/MenuItem");
const Restaurant = require("../models/restaurantModel");
const Order = require("../models/Order");
const Notification = require("../models/Notification");
const asyncHandler = require("../utils/asyncHandler");
const { validateOrderItems } = require("../utils/orderValidation");

// GET menu using table QR
exports.getMenuByTable = asyncHandler(async (req, res) => {
  const table = await Table.findById(req.params.tableId);

  if (!table) {
    res.status(404);
    throw new Error("Table not found");
  }

  const restaurant = await Restaurant.findById(table.restaurantId);

  const menu = await MenuItem.find({
    restaurantId: table.restaurantId,
    available: true,
  });

  res.json({
    restaurantId: table.restaurantId,
    restaurantName: restaurant ? restaurant.name : "Greenleaf Dining",
    tableNumber: table.tableNumber,
    settings: restaurant?.settings,
    menu,
  });
});

// GET menu using restaurant ID
exports.getMenuByRestaurant = asyncHandler(async (req, res) => {
  const restaurantId = req.params.restaurantId;
  const restaurant = await Restaurant.findById(restaurantId);

  if (!restaurant) {
    res.status(404);
    throw new Error("Restaurant not found");
  }

  const menu = await MenuItem.find({
    restaurantId,
    available: true,
  });

  res.json({
    restaurantId,
    restaurantName: restaurant.name,
    tableNumber: null, // No specific table when viewing via restaurant ID
    settings: restaurant.settings,
    menu,
  });
});

// POST order from QR
exports.createPublicOrder = asyncHandler(async (req, res) => {
  const { tableId, items, paymentMethod } = req.body;

  const table = await Table.findById(tableId);

  if (!table) {
    res.status(404);
    throw new Error("Table not found");
  }

  let menuItems;
  try {
    menuItems = await validateOrderItems(items, table.restaurantId);
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }

  let calculatedTotal = 0;

  items.forEach((orderItem) => {
    const menu = menuItems.find(
      (m) => m._id.toString() === orderItem.menuItemId
    );

    if (!menu) return;

    let itemPrice = Number(menu.price) || 0;

    // Handle portion-based pricing
    if (orderItem.portion && Array.isArray(menu.portions)) {
      const selectedPortion = menu.portions.find(
        (p) => p.label === orderItem.portion
      );

      if (selectedPortion) {
        itemPrice = Number(selectedPortion.price) || 0;
      }
    }

    const quantity = Number(orderItem.quantity) || 1;
    const itemTotal = Number(itemPrice) * Number(quantity);

    calculatedTotal += itemTotal;

    orderItem.price = itemPrice;
    orderItem.name = orderItem.portion
      ? `${menu.name} (${orderItem.portion})`
      : menu.name;
  });

  // calculate wait time using menu prepTime
  let estimatedWaitTime = 0;

  if (menuItems.length) {
    estimatedWaitTime = Math.max(
      ...menuItems.map((m) => m.prepTime || 0),
      0
    );
  }

  const restaurantId = table.restaurantId;
  const tableNumber = table.tableNumber;

  let status = "PAYMENT_PENDING";
  let confirmedByWaiter = false;

  if (paymentMethod === "CASH") {
    status = "PENDING_CONFIRMATION";
  }

  const order = await Order.create({
    restaurantId,
    tableNumber,
    items,
    total: calculatedTotal,
    paymentMethod,
    orderSource: "QR",
    status,
    estimatedWaitTime,
    confirmedByWaiter,
  });

  // Emit realtime event to kitchen dashboard only if it's not pending payment
  if (status !== "PAYMENT_PENDING") {
    const io = req.app.get("io");
    io.to(`restaurant_${restaurantId}`).emit("new-order", order);
  }

  res.status(201).json(order);
});

// POST call waiter from QR
exports.callWaiter = asyncHandler(async (req, res) => {
  const { tableId } = req.body;

  if (!tableId) {
    res.status(400);
    throw new Error("tableId is required");
  }

  const table = await Table.findById(tableId);

  if (!table) {
    res.status(404);
    throw new Error("Table not found");
  }

  const io = req.app.get("io");
  const roomName = `restaurant_${table.restaurantId.toString()}`;

  // Create persistent notification record
  const notification = await Notification.create({
    restaurantId: table.restaurantId,
    tableNumber: table.tableNumber,
    type: "WAITER_CALL"
  });


  io.to(roomName).emit("waiter-called", {
    ...notification.toObject(),
    calledAt: notification.createdAt, // For frontend compatibility
  });

  res.json({ message: "Waiter notified successfully", notification });
});