import z from 'zod';

export const standbyValidationSchema = z.object({
  date: z
    .string({
      required_error: 'Date is required',
    })
    .datetime('Date must be a valid ISO string'),

  startTime: z
    .string({
      required_error: 'Start time is required',
    })
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Start time must be in HH:mm format'),

  endTime: z
    .string({
      required_error: 'End time is required',
    })
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'End time must be in HH:mm format'),

  remarks: z
    .string({
      required_error: 'Remarks are required',
    })
    .min(1, 'Remarks cannot be empty'),
});

const create = z.object({
  body: standbyValidationSchema,
});
const update = z.object({
  body: standbyValidationSchema.deepPartial(),
});
export const standbyValidation = {
  create,
  update,
};
