import { Model, ObjectId } from 'mongoose';
import { IUser } from '../user/user.interface';

export interface IFeedback {
  id: string;
  phoneNumber: string;
  user: ObjectId | IUser;
  email: string;
  howCanWeContact: string;
  message: string;
  adminResponse: string;
  status: 'unread' | 'resolved';
}

export type IFeedbackModules = Model<IFeedback, Record<string, unknown>>;
