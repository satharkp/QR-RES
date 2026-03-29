const User = require("../models/User");
const asyncHandler = require("../utils/asyncHandler");
const bcrypt = require("bcryptjs");
const Table = require("../models/tableModel");
const { createWaiterSchema, assignTablesSchema } = require("../validators/userValidator");

// Create a new waiter account for the admin's restaurant
// Validates input, hashes password, and stores waiter with role="waiter"
exports.createWaiter = asyncHandler(async (req, res) => {
  createWaiterSchema.parse(req.body);

  const { email, password } = req.body;
  const existing = await User.findOne({ email });
  if (existing) {
    return res.status(400).json({ message: "Email already exists" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const waiter = await User.create({
    email,
    password: hashedPassword,
    role: "waiter",
    restaurantId: req.user.restaurantId,
    isMainAdmin: false,
  });

  const { password: _, ...safeWaiter } = waiter.toObject();
  res.status(201).json(safeWaiter);
});

// Create staff (waiter, kitchen, admin)
exports.createStaff = asyncHandler(async (req, res) => {
  const { email, password, role } = req.body;

  if (!["waiter", "kitchen", "admin"].includes(role)) {
    return res.status(400).json({ message: "Invalid role" });
  }

  if (role === "admin" && req.user.role !== "admin") {
    return res.status(403).json({ message: "Not allowed to create admin" });
  }

  const existing = await User.findOne({ email });
  if (existing) {
    return res.status(400).json({ message: "Email already exists" });
  }

  const hashed = await bcrypt.hash(password, 10);

  const user = await User.create({
    email,
    password: hashed,
    role,
    restaurantId: req.user.restaurantId,
    isMainAdmin: false,
  });

  const { password: _, ...safeUser } = user.toObject();

  res.status(201).json(safeUser);
});

// Fetch all waiters belonging to the current admin's restaurant
// Password field is excluded for security
exports.getWaiters = asyncHandler(async (req, res) => {
  const waiters = await User.find({
    role: "waiter",
    restaurantId: req.user.restaurantId,
  }).select("-password").lean();

  res.json(waiters);
});

// Get all staff (waiter, kitchen, admin)
exports.getStaff = asyncHandler(async (req, res) => {
  const staff = await User.find({
    restaurantId: req.user.restaurantId,
    role: { $in: ["waiter", "kitchen", "admin"] },
  }).select("-password").lean();

  res.json(staff);
});

// Assign one or more tables to a waiter
// If tableIds is empty or missing, assignment will be cleared
// Validation runs only when assigning tables (not clearing)
exports.assignTablesToWaiter = asyncHandler(async (req, res) => {
  const { tableIds } = req.body || {};

  // Validate only when assigning tables (not clearing)
  if (Array.isArray(tableIds) && tableIds.length > 0) {
    assignTablesSchema.parse(req.body);
  }

  const waiter = await User.findById(req.params.id);
  if (waiter && String(waiter.restaurantId) !== String(req.user.restaurantId)) {
    return res.status(403).json({ message: "Unauthorized" });
  }

  if (!waiter) {
    res.status(404);
    throw new Error("Waiter not found");
  }

  if (waiter.role !== "waiter") {
    return res.status(400).json({
      message: "User is not a waiter",
    });
  }

  waiter.assignedTables = tableIds || [];
  await waiter.save();

  res.json({
    message: "Tables assigned successfully",
    waiter,
  });
});

// Remove all table assignments from a waiter
exports.clearWaiterTables = asyncHandler(async (req, res) => {
  const waiter = await User.findById(req.params.id);
  if (waiter && String(waiter.restaurantId) !== String(req.user.restaurantId)) {
    return res.status(403).json({ message: "Unauthorized" });
  }

  if (!waiter || waiter.role !== "waiter") {
    return res.status(404).json({ message: "Waiter not found" });
  }

  waiter.assignedTables = [];
  await waiter.save();

  res.json({ message: "Tables cleared", waiter });
});

// Permanently delete a waiter account from the restaurant
exports.deleteWaiter = asyncHandler(async (req, res) => {
  const waiter = await User.findById(req.params.id);
  if (waiter && String(waiter.restaurantId) !== String(req.user.restaurantId)) {
    return res.status(403).json({ message: "Unauthorized" });
  }

  if (!waiter || waiter.role !== "waiter") {
    return res.status(404).json({ message: "Waiter not found" });
  }

  await waiter.deleteOne();

  res.json({ message: "Waiter removed" });
});

// Delete any staff (waiter, kitchen, admin)
exports.deleteStaff = asyncHandler(async (req, res) => {
  const staff = await User.findById(req.params.id);

  if (!staff) {
    return res.status(404).json({ message: "Staff not found" });
  }

  if (String(staff.restaurantId) !== String(req.user.restaurantId)) {
    return res.status(403).json({ message: "Unauthorized" });
  }

  // Prevent deleting main admin
  if (staff.isMainAdmin) {
    return res.status(403).json({ message: "Cannot delete main admin" });
  }

  // Prevent self delete
  if (String(staff._id) === String(req.user._id)) {
    return res.status(400).json({ message: "You cannot delete yourself" });
  }

  await staff.deleteOne();

  res.json({ message: "Staff removed" });
});


exports.getMyAssignedTables = asyncHandler(async (req, res) => {
  const waiter = await User.findById(req.user._id)
    .populate("assignedTables");

  res.json(waiter.assignedTables || []);
});