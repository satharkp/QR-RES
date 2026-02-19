const { z } = require("zod");

const createTableSchema = z.object({
  restaurantId: z.string().min(1),
  tableNumber: z.number().int().positive(),
});

const bulkCreateTablesSchema = z.object({
  restaurantId: z.string().min(1),
  count: z.number().int().positive(),
});

module.exports = {
  createTableSchema,
  bulkCreateTablesSchema,
};