import { Model, ObjectId } from 'mongoose';
import { IUser } from '../user/user.interface';

export interface IDnd {
  date: Date;
  remarks: string;
  user: ObjectId | IUser;
  isDeleted: boolean;
}

export type IDndModules = Model<IDnd, Record<string, unknown>>;
