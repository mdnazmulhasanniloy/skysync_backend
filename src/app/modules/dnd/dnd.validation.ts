import z from 'zod';

export const dndValidationSchema = z.object({
  date: z
    .string({
      required_error: 'Date is required',
    })
    .datetime('Date must be a valid ISO string'),

  remarks: z
    .string({
      required_error: 'Remarks are required',
    })
    .min(1, 'Remarks cannot be empty'),
});

const create = z.union([
  dndValidationSchema,
  z.array(dndValidationSchema).min(1, 'At least one flight is required'),
]);

// const create = z.object({
//   body: dndValidationSchema,
// });

const update = z.object({
  body: dndValidationSchema.deepPartial(),
});

export const dndValidation = {
  create,
  update,
};
