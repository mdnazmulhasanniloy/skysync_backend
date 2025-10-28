import { Model, ObjectId } from 'mongoose';
import { BOOKMARK_MODEL_TYPE } from './bookmark.constants';
import { IUser } from '../user/user.interface';
import { IFlight } from '../flight/flight.interface';
import { IDayOff } from '../dayOff/dayOff.interface';
import { IDnd } from '../dnd/dnd.interface';
import { IStandby } from '../standby/standby.interface';

export interface IBookmark {
  modelType: String | BOOKMARK_MODEL_TYPE;
  reference: ObjectId | IFlight | IDayOff | IDnd | IStandby;
  user: ObjectId | IUser;
  message?: string;
}

export type IBookmarkModules = Model<IBookmark, Record<string, unknown>>;
