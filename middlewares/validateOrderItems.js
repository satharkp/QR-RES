const MenuItem = require("../models/MenuItem");

const validateOrderItems = async (req, res, next) => {
  try {
    const { items } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "Order items required" });
    }

    const menuItemIds = items.map((i) => i.menuItemId).filter(Boolean);

    const menuItems = await MenuItem.find({
      _id: { $in: menuItemIds },
      available: true,
    });

    if (menuItems.length !== menuItemIds.length) {
      return res.status(400).json({
        message: "One or more menu items are unavailable",
      });
    }

    req.menuItems = menuItems; // pass forward
    next();
  } catch (err) {
    next(err);
  }
};

module.exports = validateOrderItems;