import z from 'zod';

export const flightValidationSchema = z.object({
  schedulePeriod: z.object({
    startAt: z
      .string({
        required_error: 'Start date is required',
      })
      .datetime('Start date must be a valid ISO string'),
    endAt: z
      .string({
        required_error: 'End date is required',
      })
      .datetime('End date must be a valid ISO string'),
  }),

  flightInformation: z.object({
    sq1: z.string({ required_error: 'SQ1 is required' }).min(1),
    sq2: z.string({ required_error: 'SQ2 is required' }).min(1),
  }),

  sector: z.object({
    from: z.string({ required_error: 'From sector is required' }).min(1),
    to: z.string({ required_error: 'To sector is required' }).min(1),
    sector4th: z.string().optional(),
  }),

  fleet: z.object({
    fleet1: z
      .number({
        required_error: 'Fleet1 is required',
      })
      .min(0, 'Fleet1 must be a positive number'),
    fleet2: z
      .number({
        required_error: 'Fleet2 is required',
      })
      .min(0, 'Fleet2 must be a positive number'),
  }),

  remarks: z.string().optional(),
  isDeleted: z.boolean().optional().default(false),
});

// const create = z.object({
//   body: flightValidationSchema,
// });
const create = z.union([
  flightValidationSchema,
  z.array(flightValidationSchema).min(1, 'At least one flight is required'),
]);

const update = z.object({
  body: flightValidationSchema.deepPartial(),
});

export const flightValidation = {
  create,
  update,
};
