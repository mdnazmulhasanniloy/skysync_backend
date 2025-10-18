import { model, Schema, Types } from 'mongoose';
import { IPayments, IPaymentsModules } from './payments.interface';
import generateCryptoString from '../../utils/generateCryptoString';

const paymentsSchema = new Schema<IPayments>(
  {
    id: {
      type: String,
      default: '#' + generateCryptoString(10),
    },
    user: {
      type: Types.ObjectId,
      ref: 'User',
    },
    subscription: {
      type: Types.ObjectId,
      ref: 'Subscriptions',
    },
    amount: {
      type: Number,
      required: true,
    },
    trnId: {
      type: String,
      default: null,
    },
    paymentAt: {
      type: String,
      default: null,
    },
    receiptUrl: {
      type: String,
      default: null,
    },
    isPaid: { type: 'boolean', default: false },
    isDeleted: { type: 'boolean', default: false },
  },
  {
    timestamps: true,
  },
);

const Payments = model<IPayments, IPaymentsModules>('Payments', paymentsSchema);
export default Payments;
