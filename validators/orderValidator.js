const { z } = require("zod");

/*
Base schema for order items
*/
const orderItemsSchema = z.array(
  z.object({
    menuItemId: z.string().min(1),
    quantity: z.number().int().positive(),
    portion: z.string().nullable().optional(),
  })
).min(1);

/*
Base order schema
*/
const baseOrderSchema = z.object({
  items: orderItemsSchema,
  paymentMethod: z.enum(["CASH", "UPI", "CARD"]),
  orderType: z.enum(["DINE_IN", "TAKEAWAY"]).optional(),
});

/*
Public QR order schema
*/
const createPublicOrderSchema = baseOrderSchema.extend({
  tableId: z.string().min(1),
});

/*
Internal order schema
*/
const createOrderSchema = baseOrderSchema.extend({
  restaurantId: z.string(),
  tableNumber: z.number().int().positive(),
  orderSource: z.enum(["WAITER", "ADMIN", "QR"]),
  total: z.number().nonnegative(),
});

module.exports = {
  createPublicOrderSchema,
  createOrderSchema,
};