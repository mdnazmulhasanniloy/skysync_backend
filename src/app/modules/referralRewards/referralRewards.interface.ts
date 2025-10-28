import { Model, ObjectId } from 'mongoose';
import { IUser } from '../user/user.interface';
import { ISubscriptions } from '../subscription/subscription.interface';

export interface IReferralRewards {
  referrer: ObjectId | IUser;
  referredUser: ObjectId | IUser;
  subscription: ObjectId | ISubscriptions;
  convertedToCoin: boolean;
  isWithdrawn: boolean;
  status: 'pending' | 'completed';
}

export type IReferralRewardsModules = Model<
  IReferralRewards,
  Record<string, unknown>
>;
