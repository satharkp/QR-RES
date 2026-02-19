const { z } = require("zod");

const createWaiterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const assignTablesSchema = z.object({
  tableIds: z.array(z.string()).min(1),
});

module.exports = {
  createWaiterSchema,
  assignTablesSchema,
};