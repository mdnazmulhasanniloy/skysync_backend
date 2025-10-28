import { Model, ObjectId } from 'mongoose';
import { IUser } from '../user/user.interface';

export interface IWithdraw {
  user: ObjectId | IUser;
  amount: number;
  status: 'pending' | 'accepted' | 'rejected';
  bankName: string;
  accNumber: number;
  branchName: string;
  routingNumber: number;
  reason: string;
  tranId: string;
  isDeleted: boolean;
}

export type IWithdrawModules = Model<IWithdraw, Record<string, unknown>>;
