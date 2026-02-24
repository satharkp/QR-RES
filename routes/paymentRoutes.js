const express = require("express");
const router = express.Router();

const {
  createRazorpayOrder,
  verifyPayment,
} = require("../controllers/paymentController");

// Create Razorpay order (frontend calls this first)
router.post("/razorpay/order", createRazorpayOrder);

// Verify payment after successful checkout
router.post("/razorpay/verify", verifyPayment);

module.exports = router;