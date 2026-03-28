const express = require("express");
const router = express.Router();
const { loginSuperAdmin } = require("../controllers/authController");
const { getAllRestaurants, createRestaurant, toggleRestaurantActive, updateSubscription, deleteRestaurant } = require("../controllers/superAdminController");
const { protectSuperAdmin } = require("../middlewares/authMiddleware");

// Auth
router.post("/login", loginSuperAdmin);

// Restaurant management (protected)
router.get("/restaurants", protectSuperAdmin, getAllRestaurants);
router.post("/restaurants", protectSuperAdmin, createRestaurant);
router.patch("/restaurants/:id/toggle", protectSuperAdmin, toggleRestaurantActive);
router.patch("/restaurants/:id/subscription", protectSuperAdmin, updateSubscription);
router.delete("/restaurants/:id", protectSuperAdmin, deleteRestaurant);

module.exports = router;
