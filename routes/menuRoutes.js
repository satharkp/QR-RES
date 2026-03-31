const express = require("express");
const router = express.Router();

const protect = require("../middlewares/authMiddleware");
const allowRoles = require("../middlewares/roleMiddleware");
const checkRestaurantAccess = require("../middlewares/restaurantAccess");
const upload = require("../middlewares/uploadMiddleware");
const checkRestaurantActive = require("../middlewares/checkRestaurantActive");

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
  checkRestaurantActive,
  allowRoles("admin", "waiter", "kitchen"),
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
  checkRestaurantActive,
  allowRoles("admin", "waiter", "kitchen"),
  checkRestaurantAccess,
  deleteMenuItem
);

// Delete all menu items
router.delete(
  "/",
  protect,
  checkRestaurantActive,
  allowRoles("admin"),
  checkRestaurantAccess,
  deleteRestaurantMenu
);

// Update menu item
router.put(
  "/:id",
  protect,
  checkRestaurantActive,
  allowRoles("admin", "waiter", "kitchen"),
  upload.single("image"),
  checkRestaurantAccess,
  updateMenuItem
);

// Toggle availability
router.patch( "/:id/availability", protect, checkRestaurantActive, allowRoles("admin", "kitchen"),
checkRestaurantAccess,toggleAvailability);

module.exports = router;