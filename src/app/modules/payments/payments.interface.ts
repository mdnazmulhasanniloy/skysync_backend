import { Model, ObjectId } from 'mongoose';
import { ISubscriptions } from '../subscription/subscription.interface';
import { IUser } from '../user/user.interface';

export interface IPayments {
  id: string;
  user: ObjectId | IUser;
  subscription: ObjectId | ISubscriptions;
  amount: number;
  trnId: string;
  paymentAt: string;
  receiptUrl: string;
  isPaid: boolean;
  isDeleted: boolean;
}

export type IPaymentsModules = Model<IPayments, Record<string, unknown>>;
