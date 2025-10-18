import { Model, ObjectId } from 'mongoose';
import { IPackage } from '../package/package.interface';

export interface ISubscriptions {
  user: ObjectId;
  package: ObjectId | IPackage;
  isPaid: boolean;
  trnId: string;
  amount: number;
  expiredAt: Date;
  isExpired: boolean;
  isFirstTime: boolean;
  isDeleted: boolean;
}

export type ISubscriptionsModel = Model<
  ISubscriptions,
  Record<string, unknown>
>;
