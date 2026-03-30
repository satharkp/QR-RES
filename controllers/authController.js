const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const SuperAdmin = require("../models/SuperAdmin");
const Restaurant = require("../models/restaurantModel");
const asyncHandler = require("../utils/asyncHandler");
const { loginSchema } = require("../validators/authValidator");

exports.loginUser = asyncHandler(async (req, res) => {
  loginSchema.parse(req.body);
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const match = await bcrypt.compare(password, user.password);

  if (!match) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  // 🔥 Check restaurant status
  if (!user.restaurantId) {
    return res.status(403).json({ message: "Restaurant not found" });
  }

  const restaurant = await Restaurant.findById(user.restaurantId);

  if (!restaurant || !restaurant.isActive) {
    return res.status(403).json({ message: "Restaurant is deactivated" });
  }

  const token = jwt.sign(
    {
      userId: user._id,
      role: user.role,
      restaurantId: user.restaurantId,
      isMainAdmin: user.isMainAdmin ,
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  res.json({ token });
});

exports.loginSuperAdmin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const superAdmin = await SuperAdmin.findOne({ email });
  if (!superAdmin) return res.status(401).json({ message: "Invalid credentials" });

  const match = await bcrypt.compare(password, superAdmin.password);
  if (!match) return res.status(401).json({ message: "Invalid credentials" });

  const token = jwt.sign(
    { userId: superAdmin._id, role: "superadmin" },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  res.json({ token });
});