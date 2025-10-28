import { model, Schema } from 'mongoose';
import { IStandby, IStandbyModules } from './standby.interface';

const standbySchema = new Schema<IStandby>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    startTime: {
      type: String,
      required: true,
    },
    endTime: {
      type: String,
      required: true,
    },
    remarks: {
      type: String,
      required: true,
    },
    isDeleted: { type: 'boolean', default: false },
  },
  {
    timestamps: true,
  },
);

const Standby = model<IStandby, IStandbyModules>('Standby', standbySchema);
export default Standby;
