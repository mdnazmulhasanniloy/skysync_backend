import { model, Schema, Types } from 'mongoose';
import { IWithdraw, IWithdrawModules } from './withdraw.interface';

const withdrawSchema = new Schema<IWithdraw>(
  {
    user: {
      type: Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected'],
      default: 'pending',
      required: true,
    },
    bankName: {
      type: String,
      required: true,
    },
    accNumber: {
      type: Number,
      required: true,
    },
    branchName: {
      type: String,
      required: true,
    },
    routingNumber: {
      type: Number,
      required: false,
      default: null,
    },
    tranId: {
      type: String,
      trim: true,
      default: null,
    },
    reason: {
      type: String,
      default: null,
    },
    isDeleted: { type: 'boolean', default: false },
  },
  {
    timestamps: true,
  },
);
withdrawSchema.index({ tranId: 1 }, { unique: true, sparse: true });
const Withdraw = model<IWithdraw, IWithdrawModules>('Withdraw', withdrawSchema);
export default Withdraw;
