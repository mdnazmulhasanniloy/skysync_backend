import { Model, ObjectId } from 'mongoose';
import { IUser } from '../user/user.interface';
import { IGiftCard } from '../giftCard/giftCard.interface';

export interface IRedem {
  id: string;
  user: ObjectId | IUser;
  giftCard: ObjectId | IGiftCard;
  //   type: 'denomination' | 'points';
  status: 'pending' | 'accepted' | 'rejected';
  denomination: number;
  points: number;
  giftCode: string;
  reason: string;
  redeemeAt: Date;
  isDeleted: boolean;
}

export type IRedemModules = Model<IRedem, Record<string, unknown>>;
