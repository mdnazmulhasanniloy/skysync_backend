import { Model, ObjectId } from 'mongoose';
import { IUser } from '../user/user.interface';

export interface IStandby {
  user: ObjectId | IUser;
  date: string;
  startTime: string;
  endTime: string;
  remarks: string;
  isDeleted: boolean;
}

export type IStandbyModules = Model<IStandby, Record<string, unknown>>;
