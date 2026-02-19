const express = require("express");
const router = express.Router();

const checkRestaurantAccess = require("../middlewares/restaurantAccess");
const protect = require("../middlewares/authMiddleware");
const allowRoles = require("../middlewares/roleMiddleware");

const {
  createOrder,
  getWaiterOrders,
  getKitchenOrders,
  getOrdersByRestaurant,
  updateOrderStatus,
  confirmOrder,
  getOrderById,
} = require("../controllers/orderController");

// Create order
router.post("/", checkRestaurantAccess, createOrder);

// Waiter dashboard
router.get("/waiter", protect, allowRoles("waiter"), getWaiterOrders);

// Kitchen dashboard
router.get("/kitchen", protect, allowRoles("kitchen", "admin"), getKitchenOrders);

// Get order by ID
router.get("/:id", getOrderById);

// Update status
router.patch("/:id/status", protect, allowRoles("kitchen", "waiter", "admin"), updateOrderStatus);

// Confirm order
router.patch("/:id/confirm", confirmOrder);

// Get orders by restaurant
router.get("/restaurant/:restaurantId", getOrdersByRestaurant);


module.exports = router;