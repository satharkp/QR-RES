const express = require("express");
const router = express.Router();
const {
  getOverviewStats,
  getPopularItems,
  getOperationalStats,
  getTrends,
} = require("../controllers/analyticsController");
const authMiddleware = require("../middlewares/authMiddleware");

// All stats routes are protected and for admin only
router.use(authMiddleware);

router.get("/overview", getOverviewStats);
router.get("/popular-items", getPopularItems);
router.get("/operational", getOperationalStats);
router.get("/trends", getTrends);

module.exports = router;
