const { z } = require("zod");

const createRestaurantSchema = z.object({
  name: z.string().min(2),
  domain: z.string().min(2),
  currency: z.string().min(2),

  adminEmail: z.string().email(),
  adminPassword: z.string().min(6),

  kitchenEmail: z.string().email(),
  kitchenPassword: z.string().min(4).optional(),
});

module.exports = {
  createRestaurantSchema,
};