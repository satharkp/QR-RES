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
  markOrderAsPaid,
  getOrderById,
  clearAllOrders,
} = require("../controllers/orderController");

// Create order
router.post("/", checkRestaurantAccess, createOrder);

// Waiter dashboard
router.get("/waiter", protect, allowRoles("waiter"), getWaiterOrders);

// Kitchen dashboard
router.get("/kitchen", protect, allowRoles("kitchen", "admin"), getKitchenOrders);

// Get orders by restaurant (MUST be before /:id)
router.get("/restaurant/:restaurantId", getOrdersByRestaurant);

// Update status
router.patch(
  "/:id/status",
  protect,
  allowRoles("kitchen", "waiter", "admin"),
  updateOrderStatus
);

// Confirm order
router.patch("/:id/confirm", confirmOrder);

// Mark as paid (CASHIER)
router.patch("/pay/:id", protect, allowRoles("admin", "waiter"), markOrderAsPaid);

// Get order by ID (Generic route at the bottom)
router.get("/:id", getOrderById);

// Clear all orders
router.post("/clear-all", protect, allowRoles("admin"), clearAllOrders);

module.exports = router;