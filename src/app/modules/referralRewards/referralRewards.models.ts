import { model, Schema, Types } from 'mongoose';
import {
  IReferralRewards,
  IReferralRewardsModules,
} from './referralRewards.interface';

const referralRewardsSchema = new Schema<IReferralRewards>(
  {
    referrer: {
      type: Types.ObjectId,
      ref: 'User',
      required: true,
    },
    referredUser: {
      type: Types.ObjectId,
      ref: 'User',
      required: true,
    },
    subscription: {
      type: Types.ObjectId,
      ref: 'Subscriptions',
      default: null,
    },
    status: {
      type: String,
      enum: ['pending', 'completed'],
      default: 'pending',
    },
  },
  {
    timestamps: true,
  },
);

const ReferralRewards = model<IReferralRewards, IReferralRewardsModules>(
  'ReferralRewards',
  referralRewardsSchema,
);
export default ReferralRewards;
