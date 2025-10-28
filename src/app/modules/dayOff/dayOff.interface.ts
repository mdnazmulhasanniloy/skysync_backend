import { Model, ObjectId } from 'mongoose';

export interface IDayOff {
  user: ObjectId;
  schedulePeriod: Date;
  remarks: string;
  isDeleted: boolean;
}

export type IDayOffModules = Model<IDayOff, Record<string, unknown>>;
