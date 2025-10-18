import z from 'zod';

const schema = z.object({
  phoneNumber: z
    .string()
    .min(1, { message: 'Phone number is required' })
    .trim(),
  email: z
    .string()
    .email({ message: 'Invalid email address' })
    .nullable()
    .optional(),
  howCanWeContact: z
    .string()
    .min(1, { message: 'Contact preference is required' })
    .trim(),
  message: z.string().min(1, { message: 'Message is required' }),
});

const createSchema = z.object({
  body: schema,
});
const updateSchema = z.object({
  body: schema.partial(),
});

export const FeedbackValidator = {
  createSchema,
  updateSchema,
};
