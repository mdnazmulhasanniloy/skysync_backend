import { model, Schema, Types } from 'mongoose';
import { IDayOff, IDayOffModules } from './dayOff.interface';

const dayOffSchema = new Schema<IDayOff>(
  {
    user: {
      type: Types.ObjectId,
      ref: 'User',
      required: true,
    },
    schedulePeriod: {
      type: String,
      required: true,
    },
    remarks: {
      type: String,
      default: null,
    },
    isDeleted: { type: 'boolean', default: false },
  },
  {
    timestamps: true,
  },
);

const DayOff = model<IDayOff, IDayOffModules>('DayOff', dayOffSchema);
export default DayOff;
