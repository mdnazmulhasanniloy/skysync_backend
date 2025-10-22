import { model, Schema } from 'mongoose';
import { IGiftCard, IGiftCardModules } from './giftCard.interface';

const giftCardSchema = new Schema<IGiftCard>(
  {
    brand: {
      type: String,
      required: true,
    },

    denomination: {
      type: Number,
      required: true,
    },
    pointsRequired: {
      type: Number,
      required: true,
    },
    status: { type: Boolean, default: false },
    description: {
      type: String,
      required: true,
    },
    logo: {
      type: String,
      default: null,
    },
    isDeleted: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  },
);

const GiftCard = model<IGiftCard, IGiftCardModules>('GiftCard', giftCardSchema);
export default GiftCard;
