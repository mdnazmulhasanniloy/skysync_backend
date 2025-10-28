import { Model, ObjectId } from 'mongoose';

export interface IFlight {
  user: ObjectId;
  schedulePeriod: {
    startAt: string;
    endAt: string;
  };
  flightInformation: {
    sq1: string;
    sq2: string;
  };
  sector: {
    from: string;
    to: string;
    sector4th: string;
  };
  fleet: {
    fleet1: number;
    fleet2: number;
  };
  remarks: string;
  isDeleted: boolean;
}

export type IFlightModules = Model<IFlight, Record<string, unknown>>;
