const crypto = require("crypto");
const Order = require("../models/Order");
const razorpay = require("../config/razorpay");

exports.createRazorpayOrder = async (req, res) => {
  try {
    const { amount } = req.body;

    const options = {
      amount: amount * 100, // IMPORTANT: Razorpay works in paise
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);

    res.status(200).json(order);
  } catch (error) {
    console.error("Razorpay error:", error);
    res.status(500).json({ message: "Failed to create Razorpay order" });
  }
};

exports.verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderId,
    } = req.body;

    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest("hex");

    if (generatedSignature !== razorpay_signature) {
      return res.status(400).json({ message: "Payment verification failed" });
    }

    const dbOrder = await Order.findById(orderId);

    if (!dbOrder) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (dbOrder.status !== "PAYMENT_PENDING") {
      return res.status(400).json({ message: "Order already processed or not pending payment" });
    }

    dbOrder.status = "PLACED";
    dbOrder.isPaid = true;
    dbOrder.confirmedByWaiter = true; // For online payments, we auto-confirm for kitchen

    // Store razorpay details for reference
    dbOrder.razorpay_payment_id = razorpay_payment_id;
    dbOrder.razorpay_order_id = razorpay_order_id;

    await dbOrder.save();

    // Populate restaurantId before emitting to ensure name/settings are available on receipt
    await dbOrder.populate("restaurantId", "name settings");

    // Emit realtime event for kitchen dashboards now that payment is confirmed
    const io = req.app.get("io");
    io.to(`restaurant_${dbOrder.restaurantId._id || dbOrder.restaurantId}`).emit("new-order", dbOrder);

    res.status(200).json({ message: "Payment verified successfully", order: dbOrder });
  } catch (error) {
    console.error("Verify payment error:", error);
    res.status(500).json({ message: "Payment verification failed" });
  }
};