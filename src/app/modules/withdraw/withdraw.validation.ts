import { z } from 'zod';

export const schema = z.object({
  amount: z
    .number({ invalid_type_error: 'Amount must be a number' })
    .positive('Amount must be greater than 0'),
  status: z.enum(['pending', 'accepted', 'rejected']).default('pending'),
  bankName: z.string().min(2, 'Bank name is required'),
  accNumber: z
    .number({ invalid_type_error: 'Account number must be a number' })
    .min(3, 'Routing number is required'),
  branchName: z.string().min(1, 'Branch name is required'),
  routingNumber: z
    .number({ invalid_type_error: 'Routing number must be a number' })
    .min(3, 'Routing number is required')
    .optional(),
});

const create = z.object({
  body: schema,
});
const accept = z.object({
  body: z.object({
    tranId: z.string().min(1, 'Transaction ID is required'),
  }),
});
const reject = z.object({
  body: z.object({
    reason: z.string().min(1, 'Transaction ID is required'),
  }),
});

export const WithdrawValidation = {
  create,
  accept,
  reject,
};
