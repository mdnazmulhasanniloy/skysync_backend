import z from 'zod';

export const giftCardZodSchema = z.object({
  brand: z.string({
    required_error: 'Brand is required',
  }),

  denomination: z.number({
    required_error: 'Denomination is required',
  }),

  pointsRequired: z.number({
    required_error: 'Points required is required',
  }),

  status: z.boolean().optional().default(false),

  description: z.string({
    required_error: 'Description is required',
  }),

  logo: z.string().nullable().optional(),

  isDeleted: z.boolean().optional().default(false),
});

const create = z.object({
  body: giftCardZodSchema,
});
const update = z.object({
  body: giftCardZodSchema.deepPartial(),
});


export const giftCardValidation = {
  create,
  update,
};
