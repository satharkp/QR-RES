const express = require("express");
const router = express.Router();

const protect = require("../middlewares/authMiddleware");
const allowRoles = require("../middlewares/roleMiddleware");
const checkRestaurantAccess = require("../middlewares/restaurantAccess");
const upload = require("../middlewares/uploadMiddleware");

const {
  createMenuItem,
  getMenuByRestaurant,
  deleteMenuItem,
  deleteRestaurantMenu,
  updateMenuItem,
  toggleAvailability,
} = require("../controllers/menuController");

// Create menu item
router.post(
  "/",
  protect,
  allowRoles("admin", "waiter"),
  upload.single("image"),
  checkRestaurantAccess,
  createMenuItem
);

// Get menu by restaurant
router.get("/:restaurantId", getMenuByRestaurant);

// Delete menu item
router.delete(
  "/item/:id",
  protect,
  allowRoles("admin", "waiter"),
  checkRestaurantAccess,
  deleteMenuItem
);

// Delete all menu items
router.delete(
  "/",
  protect,
  allowRoles("admin"),
  checkRestaurantAccess,
  deleteRestaurantMenu
);

// Update menu item
router.put(
  "/:id",
  protect,
  allowRoles("admin", "waiter"),
  upload.single("image"),
  checkRestaurantAccess,
  updateMenuItem
);

// Toggle availability
router.patch(
  "/:id/availability",
  protect,
  allowRoles("admin", "waiter"),
  checkRestaurantAccess,
  toggleAvailability
);

module.exports = router;