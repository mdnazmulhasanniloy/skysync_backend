import { model, Schema, Types } from 'mongoose';
import { IRedem, IRedemModules } from './redem.interface';
import generateCryptoString from '../../utils/generateCryptoString';

const redemSchema = new Schema<IRedem>(
  {
    id: {
      type: String,
      default: generateCryptoString(10),
    },
    user: {
      type: Types.ObjectId,
      ref: 'User',
      required: true,
    },
    giftCard: {
      type: Types.ObjectId,
      ref: 'GiftCard',
      required: true,
    },
    // type: {
    //   type: String,
    //   enum: ['denomination', 'points'],
    //   default: 'points',
    // },
    status: {
      type: String,
      enum: ['pending', 'complete', 'rejected'],
    },
    denomination: {
      type: Number,
      default: null,
    },
    points: {
      type: Number,
      default: null,
    },
    giftCode: {
      type: String,
      default: null,
    },
    reason: {
      type: String,
      default: null,
    },
    redeemeAt: {
      type: Date,
      default: null,
    },
    isDeleted: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  },
);

const Redem = model<IRedem, IRedemModules>('Redem', redemSchema);
export default Redem;
