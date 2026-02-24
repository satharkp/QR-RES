const MenuItem = require("../models/MenuItem");

const validateOrderItems = async (items, restaurantId) => {
  if (!items || !Array.isArray(items) || items.length === 0) {
    throw new Error("Order items required");
  }

  const menuItemIds = items.map((i) => i.menuItemId).filter(Boolean);
  const uniqueMenuItemIds = [...new Set(menuItemIds)];

  const menuItems = await MenuItem.find({
    _id: { $in: uniqueMenuItemIds },
    restaurantId,
    available: true,
  });

  if (menuItems.length !== uniqueMenuItemIds.length) {
    throw new Error("One or more menu items are unavailable");
  }

  return menuItems;
};

module.exports = {
  validateOrderItems,
};