import { Model, ObjectId } from 'mongoose';

export interface IFeedback {
  id: string;
  phoneNumber: string;
  user: ObjectId;
  email: string;
  howCanWeContact: string;
  message: string;
  status: 'unread' | 'resolved';
}

export type IFeedbackModules = Model<IFeedback, Record<string, unknown>>;
