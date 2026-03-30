const Rating = require("../models/Rating");
const mongoose = require("mongoose");

// ➕ Create rating
exports.createRating = async (req, res) => {
  try {
    const { restaurantId, rating } = req.body;

    if (!restaurantId || !rating) {
      return res.status(400).json({ message: "Missing data" });
    }

    const newRating = await Rating.create({
      restaurantId,
      rating,
    });

    res.status(201).json(newRating);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// GET average rating
exports.getRestaurantRating = async (req, res) => {
  const { restaurantId } = req.params;

  const stats = await Rating.aggregate([
    { $match: { restaurantId: new mongoose.Types.ObjectId(restaurantId) } },
    {
      $group: {
        _id: "$restaurantId",
        avgRating: { $avg: "$rating" },
        total: { $sum: 1 },
      },
    },
  ]);

  res.json(stats[0] || { avgRating: 0, total: 0 });
};