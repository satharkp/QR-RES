const jwt = require("jsonwebtoken");
const User = require("../models/User");
const SuperAdmin = require("../models/SuperAdmin");

const protect = async (req, res, next) => {
  try {
    if (!req.headers.authorization || !req.headers.authorization.startsWith("Bearer")) {
      return res.status(401).json({ message: "No token provided" });
    }

    const token = req.headers.authorization.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const userId = decoded.userId || decoded.id;
    const user = await User.findById(userId).select("-password");

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    req.user = user;
    console.log("Authenticated user:", req.user);

    next();
  } catch (error) {
    return res.status(401).json({ message: "Not authorized", error: error.message });
  }
};

const protectSuperAdmin = async (req, res, next) => {
  try {
    if (!req.headers.authorization || !req.headers.authorization.startsWith("Bearer")) {
      return res.status(401).json({ message: "No token provided" });
    }

    const token = req.headers.authorization.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.role !== "superadmin") {
      return res.status(403).json({ message: "Access denied: superadmin only" });
    }

    const superAdmin = await SuperAdmin.findById(decoded.userId).select("-password");
    if (!superAdmin) return res.status(401).json({ message: "Super admin not found" });

    req.superAdmin = superAdmin;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Not authorized", error: error.message });
  }
};

module.exports = protect;
module.exports.protectSuperAdmin = protectSuperAdmin;