import { model, Schema, Types } from 'mongoose';
import { IFeedback, IFeedbackModules } from './feedback.interface';
import { FEEDBACK_STATUS } from './feedback.constants';
import generateCryptoString from '../../utils/generateCryptoString';

const feedbackSchema = new Schema<IFeedback>(
  {
    id: {
      type: String,
      default: '#' + generateCryptoString(10),
    },
    user: {
      type: Types.ObjectId,
      ref: 'User',
      required: true,
    },
    phoneNumber: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      default: null,
    },
    status: {
      type: String,
      enum: ['unread', 'resolved'],
      default: FEEDBACK_STATUS.unread,
    },
    howCanWeContact: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

const Feedback = model<IFeedback, IFeedbackModules>('Feedback', feedbackSchema);
export default Feedback;
