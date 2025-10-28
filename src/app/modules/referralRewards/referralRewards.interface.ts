import { Model, ObjectId } from 'mongoose';

export interface IReferralRewards {
  referrer: ObjectId;
  referredUser: ObjectId;
  subscription: ObjectId;
  convertedToCoin: boolean;
  isWithdrawn: boolean;
  status: 'pending' | 'completed';
}

export type IReferralRewardsModules = Model<
  IReferralRewards,
  Record<string, unknown>
>;
