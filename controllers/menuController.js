const MenuItem = require("../models/MenuItem");
const asyncHandler = require("../utils/asyncHandler");
const {
  createMenuItemSchema,
  updateMenuItemSchema,
} = require("../validators/menuValidator");


// Create menu item
exports.createMenuItem = asyncHandler(async (req, res) => {
  createMenuItemSchema.parse(req.body);
  const {
    name,
    measurementType,
    price,
    portions,
    category,
    restaurantId,
    prepTime,
  } = req.body;


  const item = await MenuItem.create({
    name,
    measurementType,
    price,
    portions,
    category,
    restaurantId,
    prepTime,
    image: req.file ? req.file.path : null,
  });

  res.status(201).json(item);
});

// Get menu by restaurant
exports.getMenuByRestaurant = asyncHandler(async (req, res) => {
  const items = await MenuItem.find({ restaurantId: req.params.restaurantId });
  res.json(items);
});

// Delete menu item
exports.deleteMenuItem = asyncHandler(async (req, res) => {
  const item = await MenuItem.findById(req.params.id);

  if (!item) {
    res.status(404);
    throw new Error("Menu item not found");
  }

  await item.deleteOne();
  res.json({ message: "Menu item deleted" });
});

// Delete all menu items
exports.deleteRestaurantMenu = asyncHandler(async (req, res) => {
  const { restaurantId, confirm } = req.body;

  if (!confirm) {
    return res.status(400).json({ message: "Confirmation required to delete menu" });
  }

  await MenuItem.deleteMany({ restaurantId });
  res.json({ message: "Restaurant menu cleared" });
});

// Update menu item
exports.updateMenuItem = asyncHandler(async (req, res) => {
  updateMenuItemSchema.parse(req.body);
  const item = await MenuItem.findById(req.params.id);

  if (!item) {
    res.status(404);
    throw new Error("Menu item not found");
  }

  const { name, measurementType, price, portions, category, prepTime, available } = req.body;

  item.name = name ?? item.name;
  item.measurementType = measurementType ?? item.measurementType;
  item.price = price ?? item.price;
  item.portions = portions ?? item.portions;
  item.category = category ?? item.category;
  item.prepTime = prepTime ?? item.prepTime;
  item.available = available ?? item.available;
  if (req.file) item.image = req.file.path;

  const updatedItem = await item.save();
  res.json(updatedItem);
});

// Toggle availability
exports.toggleAvailability = asyncHandler(async (req, res) => {
  const item = await MenuItem.findById(req.params.id);

  if (!item) {
    res.status(404);
    throw new Error("Menu item not found");
  }

  item.available = !item.available;
  await item.save();

  res.json({
    message: "Availability updated",
    available: item.available,
    item,
  });
});