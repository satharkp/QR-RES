const { z } = require("zod");

/* Portion schema */
const portionSchema = z.object({
  label: z.string().min(1),
  price: z.preprocess(
    (val) => (val === "" || val === undefined ? undefined : Number(val)),
    z.number().nonnegative()
  ),
});

/* Create menu item schema */
const createMenuItemSchema = z
  .object({
    name: z.string().min(1),
    category: z.string().min(1),
    description: z.string().optional(),
    restaurantId: z.string().min(1),

    measurementType: z.enum(["UNIT", "PORTION"]).default("UNIT"),

    price: z.preprocess(
      (val) => (val === "" || val === undefined ? undefined : Number(val)),
      z.number().nonnegative().optional()
    ),
    portions: z.preprocess(
      (val) => {
        if (typeof val === "string") {
          try {
            return JSON.parse(val);
          } catch (e) {
            return val;
          }
        }
        return val;
      },
      z.array(portionSchema).optional()
    ),
    prepTime: z.preprocess(
      (val) => (val === "" || val === undefined ? undefined : Number(val)),
      z.number().int().nonnegative().optional()
    ),

  })
  .superRefine((data, ctx) => {
    if (data.measurementType === "UNIT" && data.price == null) {
      ctx.addIssue({
        path: ["price"],
        message: "Price is required for UNIT items",
        code: z.ZodIssueCode.custom,
      });
    }

    if (
      data.measurementType === "PORTION" &&
      (!data.portions || data.portions.length === 0)
    ) {
      ctx.addIssue({
        path: ["portions"],
        message: "Portions are required for PORTION items",
        code: z.ZodIssueCode.custom,
      });
    }
  });

/* Update menu item schema */
const updateMenuItemSchema = z.object({
  name: z.string().min(1).optional(),
  category: z.string().min(1).optional(),
  description: z.string().optional(),
  measurementType: z.enum(["UNIT", "PORTION"]).optional(),
  price: z.number().nonnegative().optional(),
  portions: z.preprocess(
    (val) => {
      if (typeof val === "string") {
        try {
          return JSON.parse(val);
        } catch (e) {
          return val;
        }
      }
      return val;
    },
    z.array(portionSchema).optional()
  ),
  prepTime: z.number().int().nonnegative().optional(),
  available: z.boolean().optional(),
});

module.exports = {
  createMenuItemSchema,
  updateMenuItemSchema,
};