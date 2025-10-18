import { Model, ObjectId } from 'mongoose';
import { IPackage } from '../package/package.interface';
import { IUser } from '../user/user.interface';

export interface ISubscriptions {
  _id?: ObjectId | string;
  user: ObjectId | IUser;
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
