const Table = require("../models/tableModel");
const asyncHandler = require("../utils/asyncHandler");
const { createTableSchema, bulkCreateTablesSchema } = require("../validators/tableValidator");

// Bulk create tables
exports.bulkCreateTables = asyncHandler(async (req, res) => {
  bulkCreateTablesSchema.parse(req.body);

  const { restaurantId, count } = req.body;

  const tables = [];

  for (let i = 1; i <= count; i++) {
    tables.push({
      restaurantId,
      tableNumber: i,
    });
  }

  await Table.insertMany(tables);

  res.json({ message: `${count} tables created` });
});

// Get tables by restaurant
exports.getTablesByRestaurant = asyncHandler(async (req, res) => {
  const tables = await Table.find({
    restaurantId: req.params.restaurantId,
  }).sort({ tableNumber: 1 });

  res.json(tables);
});

// Create single table
exports.createTable = asyncHandler(async (req, res) => {
  createTableSchema.parse(req.body);

  const { restaurantId, tableNumber } = req.body;

  const table = await Table.create({
    restaurantId,
    tableNumber,
  });

  res.status(201).json(table);
});

// Delete table
exports.deleteTable = asyncHandler(async (req, res) => {
  const table = await Table.findById(req.params.id);

  if (!table) {
    res.status(404);
    throw new Error("Table not found");
  }

  await table.deleteOne();

  res.json({ message: "Table deleted" });
});

// Delete all tables for restaurant
exports.deleteRestaurantTables = asyncHandler(async (req, res) => {
  await Table.deleteMany({
    restaurantId: req.params.restaurantId,
  });

  res.json({ message: "All tables deleted for restaurant" });
});