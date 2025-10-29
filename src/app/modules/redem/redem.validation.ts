import z from 'zod';

const schema = z.object({
  giftCard: z.string({ required_error: 'Gift Card ID is required' }),
  status: z.enum(['pending', 'complete', 'rejected']).default('pending'),
  denomination: z.number().nullable().optional(),
  points: z.number().nullable().optional(),
  giftCode: z.string().nullable().optional(),
  reason: z.string().nullable().optional(),
  redeemeAt: z.string().datetime().nullable().optional(),
  isDeleted: z.boolean().optional().default(false),
});

const create = z.object({
  body: schema,
});
const update = z.object({
  body: schema.deepPartial(),
});

const complete = z.object({
  body: z.object({
    giftCode: z.string({ required_error: 'Gift code is required' }),
  }),
});
const reject = z.object({
  body: z.object({
    reason: z.string({ required_error: 'Reason is required' }),
  }),
});

export const RedemValidation = {
  create,
  update,
  complete,
  reject,
};
