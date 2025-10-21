import { model, Schema, Types } from 'mongoose';
import { IFlight, IFlightModules } from './flight.interface';

const flightSchema = new Schema<IFlight>(
  {
    user: {
      type: Types.ObjectId,
      ref: 'User',
      required: true,
    },
    schedulePeriod: {
      startAt: {
        type: String,
        required: true,
      },
      endAt: {
        type: String,
        required: true,
      },
    },
    flightInformation: {
      sq1: {
        type: String,
        required: true,
      },
      sq2: {
        type: String,
        required: true,
      },
    },
    sector: {
      from: {
        type: String,
        required: true,
      },
      to: {
        type: String,
        required: true,
      },
      sector4th: {
        type: String,
        required: false,
      },
    },
    fleet: {
      fleet1: {
        type: Number,
        required: true,
      },
      fleet2: {
        type: Number,
        required: true,
      },
    },
    remarks: {
      type: String,
      required: false,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

const Flight = model<IFlight, IFlightModules>('Flight', flightSchema);
export default Flight;
