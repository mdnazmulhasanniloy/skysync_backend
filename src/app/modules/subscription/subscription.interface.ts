import { Model, ObjectId } from 'mongoose'; 
import { IUser } from '../user/user.interface';
import { IPackage } from '../package/package.interface';

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
